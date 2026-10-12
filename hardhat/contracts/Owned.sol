// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title Owned
/// @notice Minimal two-step ownership shared by the AgentBL protocol contracts.
/// @dev The public `owner()` getter and the "not owner" revert string are the same
///      as in the original single-owner contracts, so existing clients and error
///      handling keep working. A transfer only completes once the new owner calls
///      `acceptOwnership()`, so a mistyped address can never lock the contract.
///      There is deliberately no `renounceOwnership()`: every contract that inherits
///      this still needs an administrator.
abstract contract Owned {
    address public owner;
    address public pendingOwner;

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /// @notice Nominate a new owner. Calling again replaces the pending nominee.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "owner=0");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Complete the transfer; only callable by the nominated address.
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "not pending owner");
        address previousOwner = owner;
        owner = msg.sender;
        pendingOwner = address(0);
        emit OwnershipTransferred(previousOwner, msg.sender);
        _afterOwnershipTransferred(previousOwner, msg.sender);
    }

    /// @dev Hook for contracts that tie an extra role to the owner (for example an
    ///      updater or attestor that the deployer receives automatically), so a former
    ///      owner does not keep that role after handing the contract over.
    function _afterOwnershipTransferred(address previousOwner, address newOwner) internal virtual {}
}
