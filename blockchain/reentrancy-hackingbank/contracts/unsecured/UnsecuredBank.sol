pragma solidity ^0.4.21;

import "./TokenAsset.sol";

contract UnsecuredBank {
    TokenAsset public token;
    mapping(address => uint256) public balanceOf;

    function UnsecuredBank(address player) public {
        token = new TokenAsset();
        // split half
        balanceOf[msg.sender] = 500000 * 10**18;
        balanceOf[player] = 500000 * 10**18;
    }

    function isComplete() public view returns (bool) {
        return token.balanceOf(this) == 0;
    }

    function tokenFallback(
        address from,
        uint256 value,
        bytes
    ) public {
        require(msg.sender == address(token));
        require(balanceOf[from] + value >= balanceOf[from]);
        balanceOf[from] += value;
    }

    function withdraw(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount);
        require(token.transfer(msg.sender, amount));
        balanceOf[msg.sender] -= amount;
    }
}
