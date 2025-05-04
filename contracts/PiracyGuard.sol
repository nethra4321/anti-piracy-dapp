// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
//Registers content creators and their IPFS CIDs.
contract PiracyGuard {
    mapping(string => address) public contentCreators;
    event ContentRegistered(string ipfsCid, address indexed creator);

    function registerContent(string calldata ipfsCid) public {
        require(contentCreators[ipfsCid] == address(0), "Already registered");
        contentCreators[ipfsCid] = msg.sender;
        emit ContentRegistered(ipfsCid, msg.sender);
    }
}
