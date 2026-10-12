// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Owned} from "./Owned.sol";

interface IRWAOfferingPoolActions {
    function applyPricingAction(
        uint256 poolId,
        uint256 newIssuePrice,
        uint8 action,
        bytes32 evidenceHash,
        bytes32 quoteHash
    ) external;
}

/// @title RiskPricingOracle (WEB3-4 / WEB3-7 / WEB3-9)
/// @notice Records AI pricing + risk signals on-chain and forwards the action to the pool.
/// @dev Aligns with docs/contracts.md §6. evidence/quote hashes are persisted and emitted.
contract RiskPricingOracle is Owned {
    uint8 public constant MAX_RISK_LEVEL = 3; // 0 LOW / 1 MEDIUM / 2 WARNING / 3 CRITICAL

    IRWAOfferingPoolActions public pool;

    mapping(address => bool) private _updaters;
    mapping(uint256 => bytes32) private _latestQuoteHash;
    mapping(uint256 => bytes32) private _latestEvidenceHash;
    mapping(bytes32 => bool) private _processedDecision;

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

    constructor(address pool_) {
        require(pool_ != address(0), "pool=0");
        pool = IRWAOfferingPoolActions(pool_);
        _updaters[msg.sender] = true;
        emit UpdaterSet(msg.sender, true);
    }

    function setUpdater(address updater, bool allowed) external onlyOwner {
        require(updater != address(0), "updater=0");
        _updaters[updater] = allowed;
        emit UpdaterSet(updater, allowed);
    }

    /// @dev The owner is an updater from deployment; that role moves with ownership.
    function _afterOwnershipTransferred(address previousOwner, address newOwner) internal override {
        if (_updaters[previousOwner]) {
            _updaters[previousOwner] = false;
            emit UpdaterSet(previousOwner, false);
        }
        _updaters[newOwner] = true;
        emit UpdaterSet(newOwner, true);
    }

    function isUpdater(address updater) external view returns (bool) {
        return _updaters[updater];
    }

    /// @notice Push AI pricing/risk result. Emits PricingUpdated and triggers pool state change.
    function updatePricing(
        uint256 poolId,
        uint256 issuePrice,
        uint8 riskLevel,
        uint8 action,
        bytes32 evidenceHash,
        bytes32 quoteHash
    ) external {
        require(_updaters[msg.sender], "not updater");
        require(issuePrice > 0, "issuePrice=0");
        require(riskLevel <= MAX_RISK_LEVEL, "riskLevel>3");
        require(evidenceHash != bytes32(0), "evidenceHash=0");
        require(quoteHash != bytes32(0), "quoteHash=0");

        bytes32 decisionId = keccak256(abi.encode(poolId, issuePrice, action, evidenceHash, quoteHash));
        require(!_processedDecision[decisionId], "decision replay");
        _processedDecision[decisionId] = true;

        _latestQuoteHash[poolId] = quoteHash;
        _latestEvidenceHash[poolId] = evidenceHash;

        emit PricingUpdated(poolId, issuePrice, riskLevel, action, evidenceHash, quoteHash, msg.sender);

        pool.applyPricingAction(poolId, issuePrice, action, evidenceHash, quoteHash);
    }

    function latestQuoteHash(uint256 poolId) external view returns (bytes32) {
        return _latestQuoteHash[poolId];
    }

    function latestEvidenceHash(uint256 poolId) external view returns (bytes32) {
        return _latestEvidenceHash[poolId];
    }

    function isDecisionProcessed(bytes32 decisionId) external view returns (bool) {
        return _processedDecision[decisionId];
    }
}
