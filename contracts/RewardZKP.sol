// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RewardZKP {
    address public owner;
    uint256 public rewardAmount;
    mapping(bytes32 => bool) public rewarded;

    event Rewarded(address indexed winner, uint256 amount, bytes32 indexed infoHash);

    constructor(uint256 _rewardAmount) {
        owner = msg.sender;
        rewardAmount = _rewardAmount;
    }

    function reward(address payable winner, bytes32 infoHash) external {
        require(!rewarded[infoHash], "Already rewarded");

        rewarded[infoHash] = true;

        (bool sent, ) = winner.call{value: rewardAmount}("");
        require(sent, "Reward transfer failed");

        emit Rewarded(winner, rewardAmount, infoHash);
    }

    receive() external payable {}
}
