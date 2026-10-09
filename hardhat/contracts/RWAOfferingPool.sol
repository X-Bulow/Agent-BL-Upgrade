// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IEBLRegistry {
    function holderOf(uint256 eblId) external view returns (address);
    function pledgedTo(uint256 eblId) external view returns (address);
    function releasePledge(uint256 eblId) external;
}

interface IRWATokenMintable {
    function mint(uint256 poolId, address investor, uint256 amount) external;
    function burn(uint256 poolId, address investor, uint256 amount) external;
    function balanceOf(uint256 poolId, address investor) external view returns (uint256);
}

interface IPaymentToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IInvestorComplianceGate {
    function isEligible(address investor, uint256 poolId) external view returns (bool);
}

/// @title RWAOfferingPool (WEB3-3/8/15/16)
/// @notice eBL-backed RWA offering state machine with autonomous executors,
///         emergency human stop and a testnet/production investor access switch.
/// @dev Subscriptions are paid in `paymentToken` (6-decimal USDC; issue prices are
///      USD * 1e6 per RWA, so `amount * issuePrice` is the USDC owed). Payments are
///      escrowed in this contract until the offering is fully subscribed, then
///      disbursed to the eBL holder (the exporter) in one transfer. A cancelled
///      offering refunds each investor exactly what they paid. The importer's
///      repayment (or liquidation proceeds) is deposited into the pool and RWA
///      holders redeem it pro rata.
contract RWAOfferingPool {
    enum OfferingState {
        Created,
        Priced,
        Open,
        Subscribed,
        Funded,
        InTransit,
        Repriced,
        Paused,
        Frozen,
        Repaid,
        Redeemed,
        Liquidation,
        Cancelled
    }

    enum AccessMode {
        Permissionless,
        ComplianceGated
    }

    uint8 public constant OPEN_OFFERING = 0;
    uint8 public constant OPEN_WITH_WARNING = 1;
    uint8 public constant REPRICE_DOWN = 2;
    uint8 public constant PAUSE_OFFERING = 3;
    uint8 public constant FREEZE_POOL = 4;
    uint8 public constant TRIGGER_LIQUIDATION = 5;
    uint8 public constant RESUME_OFFERING = 6;
    uint8 public constant SETTLE_OFFERING = 7;
    uint8 public constant EMERGENCY_PAUSE = 8;
    uint8 public constant CANCEL_OFFERING = 9;
    uint8 public constant REDEEM_OFFERING = 10;
    uint8 public constant UNFREEZE_OFFERING = 11;

    address public owner;
    address public oracle;
    IEBLRegistry public eblRegistry;
    IRWATokenMintable public rwaToken;
    IPaymentToken public immutable paymentToken;
    IInvestorComplianceGate public complianceGate;
    AccessMode public accessMode = AccessMode.Permissionless;
    bool public emergencyStopped;
    uint256 public nextPoolId = 1;

    struct Offering {
        uint256 eblId;
        uint256 tokenSupply;
        uint256 issuePrice;
        uint256 targetRedemptionValue;
        uint256 subscribed;
        uint256 repaymentAmount;
        bytes32 paymentProof;
        bytes32 arrivalProof;
        OfferingState state;
        bool exists;
    }

    /// @dev Kept apart from Offering so the existing offerings() getter ABI is unchanged.
    struct Funding {
        address issuer;          // eBL holder at creation; receives the disbursement
        uint256 escrowed;        // paymentToken held for subscriptions not yet disbursed
        bool disbursed;
        uint256 proceeds;        // repayment / liquidation proceeds still owed to RWA holders
        uint256 redeemedTokens;  // RWA already redeemed against proceeds
        bool liquidationSettled;
    }

    mapping(uint256 => Offering) public offerings;
    mapping(uint256 => Funding) public funding;
    mapping(uint256 => mapping(address => uint256)) public paidOf;
    mapping(uint256 => OfferingState) private _stateBeforePause;
    mapping(address => bool) public agentExecutor;
    uint256 private _locked = 1;

    event OfferingCreated(
        uint256 indexed poolId,
        uint256 indexed eblId,
        uint256 tokenSupply,
        uint256 issuePrice,
        uint256 targetRedemptionValue
    );
    event Subscribed(uint256 indexed poolId, address indexed investor, uint256 amount, uint256 paidAmount);
    event OfferingRepriced(
        uint256 indexed poolId,
        uint256 oldIssuePrice,
        uint256 newIssuePrice,
        bytes32 evidenceHash,
        bytes32 quoteHash
    );
    event OfferingPaused(uint256 indexed poolId, bytes32 evidenceHash);
    event OfferingResumed(uint256 indexed poolId, OfferingState restoredState, bytes32 evidenceHash);
    event OfferingStateChanged(uint256 indexed poolId, OfferingState oldState, OfferingState newState, uint8 action);
    event SettlementProofRecorded(uint256 indexed poolId, bytes32 paymentProof, bytes32 arrivalProof);
    event OfferingSettled(uint256 indexed poolId, uint256 repaymentAmount, bytes32 paymentProof, bytes32 arrivalProof);
    event AgentExecutorSet(address indexed executor, bool allowed);
    event EmergencyStopSet(bool stopped, address indexed operator, bytes32 reasonHash);
    event AccessModeSet(AccessMode mode);
    event ComplianceGateSet(address indexed gate);
    event FundsDisbursed(uint256 indexed poolId, address indexed issuer, uint256 amount);
    event OfferingCancelled(uint256 indexed poolId, bytes32 reasonHash);
    event Refunded(uint256 indexed poolId, address indexed investor, uint256 amount, uint256 tokensBurned);
    event LiquidationSettled(uint256 indexed poolId, uint256 proceeds, bytes32 proceedsProof);
    event Redeemed(uint256 indexed poolId, address indexed investor, uint256 tokensBurned, uint256 payout);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyExecutor() {
        require(msg.sender == owner || agentExecutor[msg.sender], "not executor");
        _;
    }

    modifier whenOperational() {
        require(!emergencyStopped, "emergency stopped");
        _;
    }

    modifier nonReentrant() {
        require(_locked == 1, "reentrant");
        _locked = 2;
        _;
        _locked = 1;
    }

    constructor(address eblRegistry_, address rwaToken_, address paymentToken_) {
        require(
            eblRegistry_ != address(0) && rwaToken_ != address(0) && paymentToken_ != address(0),
            "dependency=0"
        );
        owner = msg.sender;
        eblRegistry = IEBLRegistry(eblRegistry_);
        rwaToken = IRWATokenMintable(rwaToken_);
        paymentToken = IPaymentToken(paymentToken_);
    }

    function setOracle(address oracle_) external onlyOwner {
        require(oracle_ != address(0), "oracle=0");
        oracle = oracle_;
    }

    function setAgentExecutor(address executor, bool allowed) external onlyOwner {
        require(executor != address(0), "executor=0");
        agentExecutor[executor] = allowed;
        emit AgentExecutorSet(executor, allowed);
    }

    function setEmergencyStop(bool stopped, bytes32 reasonHash) external onlyOwner {
        require(emergencyStopped != stopped, "unchanged");
        emergencyStopped = stopped;
        emit EmergencyStopSet(stopped, msg.sender, reasonHash);
    }

    /// @notice Human-only pool pause that remains available during a global stop.
    function emergencyPause(uint256 poolId, bytes32 reasonHash) external onlyOwner {
        _pause(poolId, reasonHash, EMERGENCY_PAUSE);
    }

    function setComplianceGate(address gate) external onlyOwner {
        require(gate != address(0) && gate.code.length > 0, "invalid gate");
        complianceGate = IInvestorComplianceGate(gate);
        emit ComplianceGateSet(gate);
    }

    function setAccessMode(AccessMode mode) external onlyOwner {
        if (mode == AccessMode.ComplianceGated) require(address(complianceGate) != address(0), "gate missing");
        accessMode = mode;
        emit AccessModeSet(mode);
    }

    function isInvestorEligible(address investor, uint256 poolId) public view returns (bool) {
        if (accessMode == AccessMode.Permissionless) return investor != address(0);
        return address(complianceGate) != address(0) && complianceGate.isEligible(investor, poolId);
    }

    function createOffering(
        uint256 eblId,
        uint256 tokenSupply,
        uint256 issuePrice,
        uint256 targetRedemptionValue
    ) external onlyOwner whenOperational returns (uint256 poolId) {
        require(issuePrice > 0, "issuePrice=0");
        require(tokenSupply > 0, "supply=0");
        require(targetRedemptionValue >= issuePrice, "redemption<price");
        address issuer = eblRegistry.holderOf(eblId);
        require(issuer != address(0), "ebl missing");
        require(eblRegistry.pledgedTo(eblId) == address(this), "ebl not pledged to pool");

        poolId = nextPoolId++;
        offerings[poolId] = Offering({
            eblId: eblId,
            tokenSupply: tokenSupply,
            issuePrice: issuePrice,
            targetRedemptionValue: targetRedemptionValue,
            subscribed: 0,
            repaymentAmount: 0,
            paymentProof: bytes32(0),
            arrivalProof: bytes32(0),
            state: OfferingState.Open,
            exists: true
        });
        funding[poolId].issuer = issuer;

        emit OfferingCreated(poolId, eblId, tokenSupply, issuePrice, targetRedemptionValue);
        emit OfferingStateChanged(poolId, OfferingState.Created, OfferingState.Open, OPEN_OFFERING);
    }

    /// @notice Buy `amount` RWA at the current issue price. The caller must have
    ///         approved this pool for `amount * issuePrice` of the payment token.
    function subscribe(uint256 poolId, uint256 amount) external whenOperational nonReentrant {
        Offering storage o = offerings[poolId];
        Funding storage f = funding[poolId];
        require(o.exists, "pool missing");
        require(
            o.state == OfferingState.Open || o.state == OfferingState.Repriced || o.state == OfferingState.Subscribed,
            "not open"
        );
        require(!f.disbursed, "already funded");
        require(isInvestorEligible(msg.sender, poolId), "not eligible");
        require(amount > 0, "amount=0");
        require(o.subscribed + amount <= o.tokenSupply, "exceeds supply");

        uint256 paidAmount = amount * o.issuePrice;
        o.subscribed += amount;
        f.escrowed += paidAmount;
        paidOf[poolId][msg.sender] += paidAmount;

        _pullPayment(msg.sender, paidAmount);
        rwaToken.mint(poolId, msg.sender, amount);
        emit Subscribed(poolId, msg.sender, amount, paidAmount);

        OfferingState next = o.subscribed == o.tokenSupply ? OfferingState.Funded : OfferingState.Subscribed;
        if (o.state != next) _changeState(poolId, next, OPEN_OFFERING);
        if (next == OfferingState.Funded) _disburse(poolId);
    }

    /// @notice Human-only cancellation of an offering whose funds were never
    ///         disbursed. Releases the eBL pledge and opens refunds.
    function cancelOffering(uint256 poolId, bytes32 reasonHash) external onlyOwner {
        Offering storage o = offerings[poolId];
        require(o.exists, "pool missing");
        require(!funding[poolId].disbursed, "already disbursed");
        require(o.state != OfferingState.Cancelled, "already cancelled");
        _changeState(poolId, OfferingState.Cancelled, CANCEL_OFFERING);
        eblRegistry.releasePledge(o.eblId);
        emit OfferingCancelled(poolId, reasonHash);
    }

    /// @notice Return the caller's escrowed payment for a cancelled offering and
    ///         burn their RWA (tokens cannot move before disbursement).
    function refund(uint256 poolId) external whenOperational nonReentrant {
        require(offerings[poolId].state == OfferingState.Cancelled, "not cancelled");
        uint256 amount = paidOf[poolId][msg.sender];
        require(amount > 0, "nothing to refund");
        uint256 tokens = rwaToken.balanceOf(poolId, msg.sender);

        paidOf[poolId][msg.sender] = 0;
        funding[poolId].escrowed -= amount;
        if (tokens > 0) rwaToken.burn(poolId, msg.sender, tokens);
        _sendPayment(msg.sender, amount);
        emit Refunded(poolId, msg.sender, amount, tokens);
    }

    function markInTransit(uint256 poolId, bytes32 departureProof) external onlyExecutor whenOperational {
        require(departureProof != bytes32(0), "departureProof=0");
        Offering storage o = offerings[poolId];
        require(
            funding[poolId].disbursed && _isActive(o.state) && o.state != OfferingState.InTransit,
            "not funded"
        );
        _changeState(poolId, OfferingState.InTransit, OPEN_OFFERING);
    }

    function pauseOffering(uint256 poolId, bytes32 evidenceHash) external whenOperational {
        require(msg.sender == owner || msg.sender == oracle || agentExecutor[msg.sender], "not authorized");
        _pause(poolId, evidenceHash, PAUSE_OFFERING);
    }

    function resumeOffering(uint256 poolId, bytes32 evidenceHash) external onlyExecutor whenOperational {
        _resume(poolId, evidenceHash);
    }

    /// @notice Deposit the importer's repayment into the pool. The caller must have
    ///         approved this pool for `repaymentAmount` of the payment token.
    function recordImporterPayment(
        uint256 poolId,
        bytes32 paymentProof,
        uint256 repaymentAmount
    ) external onlyExecutor whenOperational nonReentrant {
        Offering storage o = offerings[poolId];
        require(_canSettleFrom(o.state), "bad settlement state");
        require(funding[poolId].disbursed, "not funded");
        require(paymentProof != bytes32(0), "paymentProof=0");
        require(repaymentAmount > 0, "repayment=0");
        require(repaymentAmount <= _maxPayout(o), "repayment above target");
        require(o.paymentProof == bytes32(0), "payment already recorded");
        o.paymentProof = paymentProof;
        o.repaymentAmount = repaymentAmount;
        _pullPayment(msg.sender, repaymentAmount);
        emit SettlementProofRecorded(poolId, o.paymentProof, o.arrivalProof);
    }

    function recordCargoArrival(uint256 poolId, bytes32 arrivalProof) external onlyExecutor whenOperational {
        Offering storage o = offerings[poolId];
        require(_canSettleFrom(o.state), "bad settlement state");
        require(arrivalProof != bytes32(0), "arrivalProof=0");
        require(o.arrivalProof == bytes32(0), "arrival already recorded");
        o.arrivalProof = arrivalProof;
        emit SettlementProofRecorded(poolId, o.paymentProof, o.arrivalProof);
    }

    function settle(uint256 poolId, uint256 repaymentAmount) external onlyExecutor whenOperational {
        Offering storage o = offerings[poolId];
        require(_canSettleFrom(o.state), "bad settlement state");
        require(o.paymentProof != bytes32(0) && o.arrivalProof != bytes32(0), "settlement proof missing");
        require(repaymentAmount > 0 && repaymentAmount == o.repaymentAmount, "repayment mismatch");
        _changeState(poolId, OfferingState.Repaid, SETTLE_OFFERING);
        funding[poolId].proceeds = repaymentAmount;
        eblRegistry.releasePledge(o.eblId);
        emit OfferingSettled(poolId, repaymentAmount, o.paymentProof, o.arrivalProof);
    }

    /// @notice Deposit what was recovered from liquidating the cargo so RWA holders
    ///         can redeem it. Proceeds may be zero (total loss).
    function recordLiquidationProceeds(
        uint256 poolId,
        uint256 proceeds,
        bytes32 proceedsProof
    ) external onlyExecutor whenOperational nonReentrant {
        Offering storage o = offerings[poolId];
        Funding storage f = funding[poolId];
        require(o.state == OfferingState.Liquidation, "not in liquidation");
        require(f.disbursed, "not funded");
        require(!f.liquidationSettled, "liquidation already settled");
        require(proceedsProof != bytes32(0), "proceedsProof=0");
        require(proceeds <= _maxPayout(o), "proceeds above target");
        f.liquidationSettled = true;
        f.proceeds = proceeds;
        if (proceeds > 0) _pullPayment(msg.sender, proceeds);
        eblRegistry.releasePledge(o.eblId);
        emit LiquidationSettled(poolId, proceeds, proceedsProof);
    }

    /// @notice Burn all of the caller's RWA for their pro-rata share of the
    ///         remaining proceeds (after repayment or a settled liquidation).
    function redeem(uint256 poolId) external whenOperational nonReentrant {
        Offering storage o = offerings[poolId];
        Funding storage f = funding[poolId];
        require(
            o.state == OfferingState.Repaid || (o.state == OfferingState.Liquidation && f.liquidationSettled),
            "not redeemable"
        );
        uint256 tokens = rwaToken.balanceOf(poolId, msg.sender);
        require(tokens > 0, "nothing to redeem");

        // Pro rata over the RWA still outstanding, so the last holder receives
        // any rounding remainder and no dust is stranded in the pool.
        uint256 outstanding = o.subscribed - f.redeemedTokens;
        uint256 payout = (f.proceeds * tokens) / outstanding;
        f.proceeds -= payout;
        f.redeemedTokens += tokens;
        rwaToken.burn(poolId, msg.sender, tokens);
        if (payout > 0) _sendPayment(msg.sender, payout);
        emit Redeemed(poolId, msg.sender, tokens, payout);

        if (o.state == OfferingState.Repaid && f.redeemedTokens == o.subscribed) {
            _changeState(poolId, OfferingState.Redeemed, REDEEM_OFFERING);
        }
    }

    /// @notice Human-only release of a frozen offering back to its prior state.
    function unfreezeOffering(uint256 poolId, bytes32 evidenceHash) external onlyOwner whenOperational {
        Offering storage o = offerings[poolId];
        require(o.exists, "pool missing");
        require(o.state == OfferingState.Frozen, "not frozen");
        OfferingState restored = _stateBeforePause[poolId];
        require(_isActive(restored), "resume state invalid");
        _changeState(poolId, restored, UNFREEZE_OFFERING);
        emit OfferingResumed(poolId, restored, evidenceHash);
    }

    /// @notice Apply an AI pricing action coming from RiskPricingOracle.
    function applyPricingAction(
        uint256 poolId,
        uint256 newIssuePrice,
        uint8 action,
        bytes32 evidenceHash,
        bytes32 quoteHash
    ) external whenOperational {
        require(msg.sender == oracle || msg.sender == owner, "not authorized");
        Offering storage o = offerings[poolId];
        require(o.exists, "pool missing");
        require(evidenceHash != bytes32(0), "evidenceHash=0");

        if (action == RESUME_OFFERING) {
            _resume(poolId, evidenceHash);
            return;
        }
        if (action == PAUSE_OFFERING) {
            _pause(poolId, evidenceHash, action);
            return;
        }
        if (action == FREEZE_POOL) {
            require(_isActive(o.state) || o.state == OfferingState.Paused, "illegal transition");
            // A paused pool already remembers its pre-pause state.
            if (o.state != OfferingState.Paused) _stateBeforePause[poolId] = o.state;
            _changeState(poolId, OfferingState.Frozen, action);
            emit OfferingPaused(poolId, evidenceHash);
            return;
        }
        if (action == TRIGGER_LIQUIDATION) {
            require(_isActive(o.state) || o.state == OfferingState.Paused || o.state == OfferingState.Frozen, "illegal transition");
            _changeState(poolId, OfferingState.Liquidation, action);
            return;
        }
        require(action == OPEN_OFFERING || action == OPEN_WITH_WARNING || action == REPRICE_DOWN, "bad action");
        require(_isActive(o.state), "illegal transition");

        if (newIssuePrice > 0 && newIssuePrice != o.issuePrice) {
            uint256 oldPrice = o.issuePrice;
            o.issuePrice = newIssuePrice;
            emit OfferingRepriced(poolId, oldPrice, newIssuePrice, evidenceHash, quoteHash);
        }
        if (action == REPRICE_DOWN && o.state != OfferingState.Repriced) {
            _changeState(poolId, OfferingState.Repriced, action);
        }
    }

    /// @notice RWA of a pool may change hands only after its escrow was disbursed.
    function transfersEnabled(uint256 poolId) external view returns (bool) {
        return funding[poolId].disbursed;
    }

    function stateOf(uint256 poolId) external view returns (OfferingState) {
        return offerings[poolId].state;
    }

    function issuePriceOf(uint256 poolId) external view returns (uint256) {
        return offerings[poolId].issuePrice;
    }

    function settlementProofs(uint256 poolId) external view returns (bytes32 paymentProof, bytes32 arrivalProof) {
        Offering storage o = offerings[poolId];
        require(o.exists, "pool missing");
        return (o.paymentProof, o.arrivalProof);
    }

    /// @dev Investors can never be owed more than target redemption value per RWA sold.
    function _maxPayout(Offering storage o) private view returns (uint256) {
        return o.subscribed * o.targetRedemptionValue;
    }

    function _disburse(uint256 poolId) internal {
        Funding storage f = funding[poolId];
        uint256 amount = f.escrowed;
        f.escrowed = 0;
        f.disbursed = true;
        _sendPayment(f.issuer, amount);
        emit FundsDisbursed(poolId, f.issuer, amount);
    }

    function _pullPayment(address from, uint256 amount) internal {
        _callPaymentToken(abi.encodeCall(IPaymentToken.transferFrom, (from, address(this), amount)));
    }

    function _sendPayment(address to, uint256 amount) internal {
        _callPaymentToken(abi.encodeCall(IPaymentToken.transfer, (to, amount)));
    }

    /// @dev Accepts tokens that return true as well as ones that return nothing.
    function _callPaymentToken(bytes memory data) private {
        (bool ok, bytes memory result) = address(paymentToken).call(data);
        require(ok && (result.length == 0 || abi.decode(result, (bool))), "payment failed");
    }

    function _pause(uint256 poolId, bytes32 evidenceHash, uint8 action) internal {
        Offering storage o = offerings[poolId];
        require(o.exists, "pool missing");
        require(_isActive(o.state), "illegal transition");
        _stateBeforePause[poolId] = o.state;
        _changeState(poolId, OfferingState.Paused, action);
        emit OfferingPaused(poolId, evidenceHash);
    }

    function _resume(uint256 poolId, bytes32 evidenceHash) internal {
        Offering storage o = offerings[poolId];
        require(o.exists, "pool missing");
        require(o.state == OfferingState.Paused, "not paused");
        OfferingState restored = _stateBeforePause[poolId];
        require(_isActive(restored), "resume state invalid");
        _changeState(poolId, restored, RESUME_OFFERING);
        emit OfferingResumed(poolId, restored, evidenceHash);
    }

    function _changeState(uint256 poolId, OfferingState newState, uint8 action) internal {
        Offering storage o = offerings[poolId];
        require(o.exists, "pool missing");
        OfferingState oldState = o.state;
        require(oldState != newState, "duplicate state");
        o.state = newState;
        emit OfferingStateChanged(poolId, oldState, newState, action);
    }

    function _isActive(OfferingState state) internal pure returns (bool) {
        return state == OfferingState.Open
            || state == OfferingState.Subscribed
            || state == OfferingState.Funded
            || state == OfferingState.InTransit
            || state == OfferingState.Repriced;
    }

    function _canSettleFrom(OfferingState state) internal pure returns (bool) {
        return _isActive(state);
    }
}
