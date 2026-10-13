# AgentBL Web3 Contract Interface

Status: WEB3-1 ~ WEB3-4 design frozen  
Naming source: `docs/PRD.md` v0.2 and `docs/tasks.md` are authoritative  
Scope: first define the minimal interface that the JS contract mock, the Hardhat contracts and the frontend can all reuse. No public fundraising, no AMM, and no promise of principal-protected returns.

## 1. Design Goals

The Web3 / Contract layer solves exactly one problem:

```text
AI Pricing & Risk Agent outputs PricingQuote / RiskReport
→ RiskPricingOracle records the price, risk action and evidence hash
→ RWAOfferingPool opens subscription, reprices, pauses, freezes or liquidates according to the action
→ the frontend and tests can verify on-chain events and state changes
```

The MVP does not aim for complex financial contracts; it prioritises:

1. eBL pledge relationships can be recorded;
2. RWA share tokens can be minted;
3. the RWA offering state machine runs end to end;
4. AI pricing and risk evidence can be audited through events;
5. every interface can be verified by the existing Harness and the later Hardhat tests.

## 2. Shared Conventions

### 2.1 Amount and Price Units

Avoid floating point in the Solidity implementation:

| Field | Suggested unit |
|---|---|
| `issuePrice` | 6 decimals, e.g. `0.80 USD` is stored as `800000` |
| `targetRedemptionValue` | 6 decimals, e.g. `1.00 USD` is stored as `1000000` |
| `tokenSupply` / `amount` | smallest RWA token unit; the MVP may treat these as whole tokens |
| `paidAmount` / `repaymentAmount` / `proceeds` | smallest unit of the payment token (USDC, 6 decimals). Subscription amount due = `amount * issuePrice`, e.g. 10 RWA × 0.80 USD = `8000000` |

The JS mock may keep human-readable `0.8` / `1`, but the Hardhat contract tests should use integer units.

### 2.2 Risk Level Enum

On-chain uses `uint8 riskLevel`; the JS layer is responsible for mapping strings to numbers.

| uint8 | Risk level |
|---:|---|
| 0 | LOW |
| 1 | MEDIUM |
| 2 | WARNING |
| 3 | CRITICAL |

### 2.3 Pricing Action Enum

On-chain uses `uint8 action`; the JS layer maintains the `contract_action` / `pricing_action` mapping.

| uint8 | PRD `pricing_action` | Harness `contract_action` | On-chain meaning |
|---:|---|---|---|
| 0 | OPEN_OFFERING | APPROVE_FINANCING | Open subscription |
| 1 | OPEN_WITH_WARNING | CONTINUE_WITH_WARNING | Continue with a warning |
| 2 | REPRICE_DOWN | TRIGGER_MARGIN_CALL | Reprice down / margin call |
| 3 | PAUSE_OFFERING | FREEZE_POOL | Pause the offering |
| 4 | FREEZE_POOL | FREEZE_POOL | Freeze the pool |
| 5 | TRIGGER_LIQUIDATION | TRIGGER_LIQUIDATION | Enter liquidation |

### 2.4 Hash Fields

| Field | Type | Meaning |
|---|---|---|
| `evidenceHash` | `bytes32` | Hash of the AI pricing / risk evidence bundle |
| `quoteHash` | `bytes32` | Hash of the structured `PricingQuote` output |
| `metadataHash` | `bytes32` | eBL metadata / document digest |

In JS every hash should be represented as `0x` + 64 hex characters.

## 3. WEB3-1: EBLRegistry

### 3.1 Purpose

`EBLRegistry` records electronic bill of lading tokens and pledge relationships. It is not an NFT marketplace and does not handle legal transfer on a real eBL platform; the MVP only provides verifiable registration, pledge and pledge-release state.

### 3.2 Interface

```solidity
interface IEBLRegistry {
    event EBLMinted(
        uint256 indexed eblId,
        bytes32 indexed metadataHash,
        address indexed holder
    );

    event EBLPledged(
        uint256 indexed eblId,
        address indexed pool,
        address indexed holder
    );

    event EBLPledgeReleased(
        uint256 indexed eblId,
        address indexed pool,
        address indexed holder
    );

    function mintEBL(bytes32 metadataHash, address holder)
        external
        returns (uint256 eblId);

    function pledge(uint256 eblId, address pool) external;

    function releasePledge(uint256 eblId) external;

    function holderOf(uint256 eblId) external view returns (address);

    function pledgedTo(uint256 eblId) external view returns (address);

    function metadataHashOf(uint256 eblId) external view returns (bytes32);
}
```

### 3.3 Permissions and Constraints

| Operation | Permission | Constraint |
|---|---|---|
| `mintEBL` | registry owner / authorized issuer | `metadataHash != 0`, `holder != address(0)` |
| `pledge` | eBL holder or authorized pool factory | eBL must exist and cannot be pledged twice |
| `releasePledge` | current pledgee pool or registry owner | eBL must already be pledged |

## 4. WEB3-2: RWAToken

### 4.1 Purpose

`RWAToken` represents the share token an investor receives after subscribing to an RWA offering. It is not a publicly traded token: only `RWAOfferingPool` can mint / burn; investors can only transfer between accounts on the owner's whitelist, and only after that offering has disbursed (refunds before disbursement are computed per payer).

### 4.2 Interface

```solidity
interface IRWAToken {
    event RWAMinted(
        uint256 indexed poolId,
        address indexed investor,
        uint256 amount
    );

    event RWABurned(uint256 indexed poolId, address indexed investor, uint256 amount);

    event RWATransferred(
        uint256 indexed poolId,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    event TransferPermissionSet(
        address indexed account,
        bool allowed
    );

    function mint(uint256 poolId, address investor, uint256 amount) external;

    function burn(uint256 poolId, address investor, uint256 amount) external;

    function transfer(uint256 poolId, address to, uint256 amount) external;

    function balanceOf(uint256 poolId, address investor)
        external
        view
        returns (uint256);

    function totalSupply(uint256 poolId) external view returns (uint256);

    function setTransferPermission(address account, bool allowed) external;

    function isTransferAllowed(address account) external view returns (bool);
}
```

### 4.3 Permissions and Constraints

| Operation | Permission | Constraint |
|---|---|---|
| `mint` | only `RWAOfferingPool` | investor must be permissioned, amount > 0 |
| `burn` | only `RWAOfferingPool` | used for refunds and redemption; balance must be sufficient |
| `transfer` | holder | both sender and recipient are on the whitelist; the pool has disbursed (`transfersEnabled`) |
| `setTransferPermission` | owner / compliance operator | sets the transfer whitelist |

## 5. WEB3-3: RWAOfferingPool

### 5.1 Purpose

`RWAOfferingPool` manages the issuance, subscription, repricing, pausing and settlement state of eBL-backed RWAs, and escrows the entire fund flow: it collects subscription payments, disburses to the exporter once fully subscribed, refunds on cancellation, and collects repayment or liquidation proceeds and pays them out pro rata to RWA holders. It consumes AI pricing results but does not compute risk itself.

### 5.2 State Machine

```text
Created
→ Priced
→ Open
→ Subscribed
→ Funded
→ InTransit
→ Repriced / Paused / Frozen
→ Repaid / Redeemed / Liquidation / Cancelled
```

### 5.3 Interface

```solidity
interface IRWAOfferingPool {
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

    event OfferingCreated(
        uint256 indexed poolId,
        uint256 indexed eblId,
        uint256 tokenSupply,
        uint256 issuePrice,
        uint256 targetRedemptionValue
    );

    event Subscribed(
        uint256 indexed poolId,
        address indexed investor,
        uint256 amount,
        uint256 paidAmount
    );

    event OfferingRepriced(
        uint256 indexed poolId,
        uint256 oldIssuePrice,
        uint256 newIssuePrice,
        bytes32 evidenceHash,
        bytes32 quoteHash
    );

    event OfferingPaused(uint256 indexed poolId, bytes32 evidenceHash);

    event OfferingStateChanged(
        uint256 indexed poolId,
        OfferingState oldState,
        OfferingState newState,
        uint8 action
    );

    event OfferingSettled(uint256 indexed poolId, uint256 repaymentAmount);

    event FundsDisbursed(uint256 indexed poolId, address indexed issuer, uint256 amount);
    event OfferingCancelled(uint256 indexed poolId, bytes32 reasonHash);
    event Refunded(uint256 indexed poolId, address indexed investor, uint256 amount, uint256 tokensBurned);
    event LiquidationSettled(uint256 indexed poolId, uint256 proceeds, bytes32 proceedsProof);
    event Redeemed(uint256 indexed poolId, address indexed investor, uint256 tokensBurned, uint256 payout);

    // constructor(address eblRegistry, address rwaToken, address paymentToken)

    function createOffering(
        uint256 eblId,
        uint256 tokenSupply,
        uint256 issuePrice,
        uint256 targetRedemptionValue
    ) external returns (uint256 poolId);

    function subscribe(uint256 poolId, uint256 amount) external;

    function pauseOffering(uint256 poolId) external;

    function applyPricingAction(
        uint256 poolId,
        uint256 newIssuePrice,
        uint8 action,
        bytes32 evidenceHash,
        bytes32 quoteHash
    ) external;

    function cancelOffering(uint256 poolId, bytes32 reasonHash) external;

    function refund(uint256 poolId) external;

    function recordImporterPayment(uint256 poolId, bytes32 paymentProof, uint256 repaymentAmount) external;

    function settle(uint256 poolId, uint256 repaymentAmount) external;

    function recordLiquidationProceeds(uint256 poolId, uint256 proceeds, bytes32 proceedsProof) external;

    function redeem(uint256 poolId) external;

    function unfreezeOffering(uint256 poolId, bytes32 evidenceHash) external;

    function transfersEnabled(uint256 poolId) external view returns (bool);

    function stateOf(uint256 poolId) external view returns (OfferingState);
}
```

### 5.4 Permissions and Constraints

| Operation | Permission | Constraint |
|---|---|---|
| `createOffering` | pool factory / exporter operator | eBL must be registered, issuePrice > 0 |
| `subscribe` | permissioned investor | pool must be Open / Repriced / Subscribed and not yet disbursed, amount > 0; must first approve `amount * issuePrice` USDC |
| `pauseOffering` | owner / oracle / risk operator | pool must not already be settled |
| `applyPricingAction` | only `RiskPricingOracle` or risk operator | action must be valid, hashes must be non-empty |
| `cancelOffering` | owner | not yet disbursed; releases the eBL pledge |
| `refund` | investor | pool is Cancelled; returns the amount the caller actually paid and burns their RWA |
| `markInTransit` | executor | already disbursed |
| `recordImporterPayment` | executor | already disbursed; repayment ≤ sold RWA × targetRedemptionValue; transfers USDC in from the caller |
| `settle` | executor | both payment proof and arrival proof are present; releases the eBL pledge |
| `recordLiquidationProceeds` | executor | pool is in Liquidation and already disbursed; can be recorded only once (may be 0); releases the eBL pledge |
| `redeem` | RWA holder | Repaid, or Liquidation with proceeds already recorded; moves to Redeemed once fully paid out |
| `unfreezeOffering` | owner | pool is Frozen; restores the state before the freeze (or before an earlier pause) |

### 5.5 Action to State Transition

| action | Target state |
|---|---|
| OPEN_OFFERING | Open |
| OPEN_WITH_WARNING | Open or Repriced |
| REPRICE_DOWN | Repriced |
| PAUSE_OFFERING | Paused |
| FREEZE_POOL | Frozen |
| TRIGGER_LIQUIDATION | Liquidation |

### 5.6 Fund Flow

The payment token is passed in at construction (the testnet uses `MockUSDC`, 6 decimals, mintable by anyone).

```text
investor subscribe ──USDC──▶ pool escrow (records paidOf per investor)
        │
        ├─ fully subscribed (Funded) ──▶ one-time disbursement to the eBL holder at creation (exporter)
        │                    only after this can RWA be transferred within the whitelist
        └─ owner cancelOffering before disbursement ──▶ Cancelled, investors refund to reclaim paidOf

executor recordImporterPayment ──USDC──▶ pool ──settle──▶ Repaid
executor recordLiquidationProceeds ──USDC──▶ pool (Liquidation)
        │
        └─ RWA holder redeem: claims remaining funds pro rata by holding / total unredeemed and burns RWA
           (the last claimant receives the rounding remainder; Repaid moves to Redeemed once fully paid out)
```

If repayment is short (partial default) or liquidation proceeds are below the target redemption value, holders bear the loss pro rata; neither repayment nor liquidation proceeds may exceed `sold RWA × targetRedemptionValue`.

## 6. WEB3-4: RiskPricingOracle

### 6.1 Purpose

`RiskPricingOracle` writes the AI's `PricingQuote` and risk action as on-chain events and forwards the action to `RWAOfferingPool`. It does not generate AI results; it only records, authorises and triggers state changes.

### 6.2 Interface

```solidity
interface IRiskPricingOracle {
    event PricingUpdated(
        uint256 indexed poolId,
        uint256 issuePrice,
        uint8 riskLevel,
        uint8 action,
        bytes32 evidenceHash,
        bytes32 quoteHash,
        address indexed updater
    );

    event UpdaterSet(address indexed updater, bool allowed);

    function updatePricing(
        uint256 poolId,
        uint256 issuePrice,
        uint8 riskLevel,
        uint8 action,
        bytes32 evidenceHash,
        bytes32 quoteHash
    ) external;

    function setUpdater(address updater, bool allowed) external;

    function isUpdater(address updater) external view returns (bool);

    function latestQuoteHash(uint256 poolId) external view returns (bytes32);

    function latestEvidenceHash(uint256 poolId) external view returns (bytes32);
}
```

### 6.3 Permissions and Constraints

| Operation | Permission | Constraint |
|---|---|---|
| `updatePricing` | authorized AI pricing updater | poolId must exist, issuePrice > 0, hashes non-empty |
| `setUpdater` | owner / governance | updater != address(0) |

### 6.4 Relationship with RWAOfferingPool

`updatePricing` should do two things:

1. emit `PricingUpdated`, leaving a record of `issuePrice`, `riskLevel`, `action`, `evidenceHash` and `quoteHash`;
2. call, or allow a later call to, `RWAOfferingPool.applyPricingAction(...)` so the offering state changes.

The MVP may perform step 2 in the JS mock or a test script first; the minimal Solidity version prioritises making the event testable.

## 7. WEB3-1 ~ WEB3-4 Definition of Done

| ID | Definition of done | Evidence |
|---|---|---|
| WEB3-1 | `EBLRegistry` interface, events, permissions and constraints are specified | `docs/contracts.md` §3 |
| WEB3-2 | `RWAToken` interface, mint permission and permissioned constraints are specified | `docs/contracts.md` §4 |
| WEB3-3 | `RWAOfferingPool` interface, state machine and action transitions are specified | `docs/contracts.md` §5 |
| WEB3-4 | `RiskPricingOracle` interface, `PricingUpdated` event and updater permission are specified | `docs/contracts.md` §6 |

The JS contract mock in WEB3-5 and the Hardhat contracts in WEB3-6 ~ WEB3-9 must align with this document.
