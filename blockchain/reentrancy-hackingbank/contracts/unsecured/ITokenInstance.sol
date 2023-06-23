pragma solidity ^0.4.21;

interface ITokenInstance {
    function tokenFallback(
        address from,
        uint256 value,
        bytes data
    ) external;
}
