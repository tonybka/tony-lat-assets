pragma solidity ^0.4.21;

import "../libraries/SafeMath.sol";
import "../libraries/ReentrancyGuard.sol";

import "./TokenAssetFixed.sol";
import "./ITokenInstanceFixed.sol";

contract BankFixed is ITokenInstanceFixed, ReentrancyGuard {
    using SafeMath for uint256;

    TokenAssetFixed public token;
    mapping(address => uint256) public balanceOf;

    function BankFixed(address player) public {
        token = new TokenAssetFixed();
        // split half of initial 1,000,000 tokens
        balanceOf[msg.sender] = 5 * 10**5 * 10**18; //	half for me
        balanceOf[player] = 5 * 10**5 * 10**18; //	half for you
    }

    function isComplete() external view returns (bool) {
        return token.balanceOf(address(this)) == 0;
    }

    function tokenFallback(
        address from,
        uint256 value,
        bytes
    ) external {
        require(msg.sender == address(token));
        require((balanceOf[from]).add(value) >= balanceOf[from]);
        balanceOf[from] = (balanceOf[from]).add(value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(balanceOf[msg.sender] >= amount);
        balanceOf[msg.sender] = (balanceOf[msg.sender]).sub(amount); // done the internal work first
        require(token.transfer(msg.sender, amount));
    }
}
