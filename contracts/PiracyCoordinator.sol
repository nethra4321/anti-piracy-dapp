// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Reads who registered the content (by CID) from the PiracyGuard contract. Used to verify that a CID is officially registered.
interface IPiracyGuard {
    function contentCreators(string calldata cid) external view returns (address);
}
// Calls the reward distribution logic from the RewardZKP contract.
interface IRewardZKP {
    function reward(address payable winner, bytes32 infoHash) external;
}

contract PiracyCoordinator {
    IPiracyGuard public piracyGuard;
    IRewardZKP public rewardZKP;

    event PiratedContentReported(address indexed scanner, bytes32 indexed infoHash, string cid);

    constructor(address _piracyGuard, address _rewardZKP) {
        piracyGuard = IPiracyGuard(_piracyGuard);
        rewardZKP = IRewardZKP(_rewardZKP);
    }

    function reportPiracy(
        address payable scanner,
        bytes32 infoHash,
        string calldata cid
    ) external {
        require(piracyGuard.contentCreators(cid) != address(0), "CID not registered");

        rewardZKP.reward(scanner, infoHash);
        emit PiratedContentReported(scanner, infoHash, cid);
    }
}
