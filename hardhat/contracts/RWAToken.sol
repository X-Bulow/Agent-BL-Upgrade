// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Owned} from "./Owned.sol";

/// @title RWAToken (WEB3-2)
/// @notice Per-pool RWA subscription share receipt. Permissioned mint, not a public token.
/// @dev Aligns with docs/contracts.md §4. Only the offering pool may mint. Shares are
///      non-transferable receipts: there is no transfer function, and
///      `setTransferPermission` only records the allow-list reserved for a future
///      permissioned secondary market.
contract RWAToken is Owned {
    address public pool;

    mapping(uint256 => mapping(address => uint256)) private _balances;
    mapping(uint256 => uint256) private _totalSupply;
    mapping(address => bool) private _transferAllowed;

    event RWAMinted(uint256 indexed poolId, address indexed investor, uint256 amount);
    event TransferPermissionSet(address indexed account, bool allowed);
    event PoolSet(address indexed pool);

    function setPool(address pool_) external onlyOwner {
        require(pool_ != address(0), "pool=0");
        pool = pool_;
        emit PoolSet(pool_);
    }

    function mint(uint256 poolId, address investor, uint256 amount) external {
        require(msg.sender == pool, "only pool");
        require(investor != address(0), "investor=0");
        require(amount > 0, "amount=0");
        _balances[poolId][investor] += amount;
        _totalSupply[poolId] += amount;
        emit RWAMinted(poolId, investor, amount);
    }

    function balanceOf(uint256 poolId, address investor) external view returns (uint256) {
        return _balances[poolId][investor];
    }

    function totalSupply(uint256 poolId) external view returns (uint256) {
        return _totalSupply[poolId];
    }

    function setTransferPermission(address account, bool allowed) external onlyOwner {
        _transferAllowed[account] = allowed;
        emit TransferPermissionSet(account, allowed);
    }

    function isTransferAllowed(address account) external view returns (bool) {
        return _transferAllowed[account];
    }
}
