pragma solidity ^0.4.21;

import "./ITokenInstance.sol";

contract TokenAsset {
    //	map	address	to	token	owned.
    mapping(address => uint256) public balanceOf;
    string public name = "Token	Asset";
    string public symbol = "TNT";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * (uint256(10)**decimals);

    event Transfer(address indexed from, address indexed to, uint256 value);

    function TokenAsset() public {
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function isContract(address _addr) private view returns (bool is_contract) {
        uint256 length;
        assembly {
            //retrieve	the	size	of	the	code on	target	address
            length := extcodesize(_addr)
        }
        return length > 0;
    }

    function transfer(address to, uint256 value) public returns (bool success) {
        bytes memory empty;
        return transfer(to, value, empty);
    }

    function transfer(
        address to,
        uint256 value,
        bytes data
    ) public returns (bool) {
        require(balanceOf[msg.sender] >= value);
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        if (isContract(to)) {
            ITokenInstance(to).tokenFallback(msg.sender, value, data);
        }
        return true;
    }

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    mapping(address => mapping(address => uint256)) public allowance;

    function approve(address spender, uint256 value)
        public
        returns (bool success)
    {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool success) {
        require(value <= balanceOf[from]);
        require(value <= allowance[from][msg.sender]);
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }
}
