// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IRWAPoolTransferGate {
    function transfersEnabled(uint256 poolId) external view returns (bool);
}

/// @title RWAToken (WEB3-2)
/// @notice Per-pool RWA subscription share receipt. Permissioned mint, not a public token.
/// @dev Aligns with docs/contracts.md §4. Only the offering pool may mint.
contract RWAToken {
    address public owner;
    address public pool;

    mapping(uint256 => mapping(address => uint256)) private _balances;
    mapping(uint256 => uint256) private _totalSupply;
    mapping(address => bool) private _transferAllowed;

    event RWAMinted(uint256 indexed poolId, address indexed investor, uint256 amount);
    event RWABurned(uint256 indexed poolId, address indexed investor, uint256 amount);
    event RWATransferred(uint256 indexed poolId, address indexed from, address indexed to, uint256 amount);
    event TransferPermissionSet(address indexed account, bool allowed);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setPool(address pool_) external onlyOwner {
        require(pool_ != address(0), "pool=0");
        pool = pool_;
    }

    function mint(uint256 poolId, address investor, uint256 amount) external {
        require(msg.sender == pool, "only pool");
        require(investor != address(0), "investor=0");
        require(amount > 0, "amount=0");
        _balances[poolId][investor] += amount;
        _totalSupply[poolId] += amount;
        emit RWAMinted(poolId, investor, amount);
    }

    /// @notice Destroy `amount` RWA held by `investor` (refunds and redemptions).
    function burn(uint256 poolId, address investor, uint256 amount) external {
        require(msg.sender == pool, "only pool");
        require(amount > 0, "amount=0");
        uint256 balance = _balances[poolId][investor];
        require(balance >= amount, "balance");
        _balances[poolId][investor] = balance - amount;
        _totalSupply[poolId] -= amount;
        emit RWABurned(poolId, investor, amount);
    }

    /// @notice Move RWA between two owner-approved accounts once the pool has
    ///         disbursed the offering (before that, refunds are owed per payer).
    function transfer(uint256 poolId, address to, uint256 amount) external {
        require(to != address(0), "to=0");
        require(amount > 0, "amount=0");
        require(_transferAllowed[msg.sender] && _transferAllowed[to], "transfer not allowed");
        require(IRWAPoolTransferGate(pool).transfersEnabled(poolId), "transfers locked");
        uint256 balance = _balances[poolId][msg.sender];
        require(balance >= amount, "balance");
        _balances[poolId][msg.sender] = balance - amount;
        _balances[poolId][to] += amount;
        emit RWATransferred(poolId, msg.sender, to, amount);
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
