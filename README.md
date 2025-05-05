# Decentralized Anti-Piracy System

This project addresses the growing challenge of digital piracy by combining decentralized technologies: Ethereum smart contracts, IPFS, BitTorrent, and zero-knowledge proofs (ZKPs). It allows creators to register original content immutably, enables decentralized detection by peers and rewards verifiable piracy reports using a trustless proof mechanism.
## Video Link
https://drive.google.com/file/d/15RCan3t-kBLdomd3nCM0tBCnpPDvhF-a/view?usp=sharing

## Folder Structure
```bash
BLOCKCHAIN_PROJECT/
│
├── backend/ # Node.js backend for seeding, DHT scanning, and proof verification
│ ├── abis/ # Contract ABIs
│ ├── downloaded/ # downloaded files
│ ├── fundContract.js #funds ETH to contract 
│ ├── report-log.json # report json for piracy dashboard
│ ├── scanner.js # Scans for pirated content
│ ├── seed-server.js # seeds uploads file to Bit torrent DHT
│ └── wallets.json # Hardhat-generated wallet keys
│
├── frontend/ # React frontend with Vite
│ ├── public/
│ └── src/
│ ├── assets/
│ ├── App.jsx
│ ├── ipfsuploader.jsx  # Frontend UI 
│ ├── report.jsx # Piracy Report dashboard
│ └── PiracyGuardABI.json
│
├── contracts/ # Solidity smart contracts
│ ├── PiracyGuard.sol # Content Registration in blockchain
│ ├── PiracyCoordinator.sol # Checks if CID is linked to the content creator
│ └── RewardZKP.sol # Rewards scanners with ETH
│
├── circuits/ # Circom ZKP circuit and keys
│ ├── powproof.circom
│ ├── powproof_final.zkey
│ └── verification_key.json
│
├── circom/ # Compiled circuit artifacts (optional)
├── scripts/ # Hardhat deployment scripts
├── artifacts/, cache/ # Hardhat build outputs
├── node_modules/ # Dependencies
├── .gitignore
├── hardhat.config.js # Hardhat config
└── package.json
```       

## Project Setup Guide

### Pre-requisites
``` bash
- Node.js v16+  
- Hardhat  
- Metamask  
- Cargo  
- Rust  
- Circom  
- SnarkJS  
- pot18_final.ptau
```
### Techstack
Blockchain & Smart Contracts
- Solidity – Smart contract development
- Hardhat – Ethereum development environment
- Ethers.js – Blockchain interaction from frontend/backend

Zero-Knowledge Proofs
- Circom – ZKP circuit design
- snarkjs – Proof generation and Groth16 verification

Frontend
- React.js – UI development
- Vite – Fast React bundler

Backend
- Node.js & Express – Server logic and APIs
- WebTorrent – Torrent seeding and peer discovery
- bittorrent-dht – Scanning BitTorrent DHT for infoHashes

Storage & Communication
- IPFS (via Pinata) – Decentralized file storage

### How to Run

### Terminal 1 – Start local Hardhat node

```bash
npx hardhat node
```

### Terminal 2 – Deploy contracts
```BASH
npx hardhat run scripts/deploy.js --network localhost  
npx hardhat run scripts/deploy-rewardzkp.js --network localhost  
npx hardhat run scripts/deploy-coord.js --network localhost
```
### Terminal 3 -  ZKP Compilation & Setup (Groth16)
Download powersOfTau28_hez_final_18.ptau from https://github.com/iden3/snarkjs#7-prepare-phase-2 and place it in the circuit folder
Compile the circuit
``` bash
circom/target/release/circom.exe circuits/powproof.circom --r1cs --wasm --sym -o circuits/
```

Setup trusted ceremony
``` bash
cd circuits
snarkjs groth16 setup powproof.r1cs pot18_final.ptau powproof_0000.zkey
```

Contribute to phase 2
``` bash
snarkjs zkey contribute powproof_0000.zkey powproof_final.zkey --name="Contributor 1" -v
```

Export verification key
```bash
snarkjs zkey export verificationkey powproof_final.zkey verification_key.json
```
### Terminal 4 – Start frontend
``` bash
cd frontend  
npm run dev
```
### Terminal 5 – Start Backend express server
``` bash
cd backend  
npm run dev
```
### Terminal 6 - Fund Reward contract with ETH
``` bash
cd backend  
node fundContract.js
```
### Metamask setup
- Open MetaMask and click on your network dropdown at the top.
- Click “Add Network” , then “Add a network manually”.
- Enter the following network details:
   - Network Name: Hardhat Localhost
   - New RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH
   - Save the network.
- Import a Hardhat test account into MetaMask:
  - When you start Hardhat locally, you’ll see test accounts printed in your terminal,
  - In MetaMask, go to your profile icon and then Import Account.
  - Paste the private key to import the account.
### How to use the dapp
- Click on "Connect to metamask"
- Choose a metamask account
- Choose a file to register and then click on "Upload to IPFS"
- Click on "Register on Blockchain"
- The content will be registered on blockchain in the terminal where you are running your hardhat node
- The file will be seeded, scanners will scan for pirated content and compete by solving POW and find a nonce as shown in backend terminal. Whichever scanner finds the nonce first will be rewarded with ETH.
- Click on View Dashboard in the UI and you will be taken to the piracy report dashboard with the list of piracies found and reported.

### Summary
- Content Registration: Creators upload original files to IPFS and register their content on-chain using smart contracts.
- Decentralized Detection: Peer nodes scan the BitTorrent DHT network to identify pirated versions of registered content.
- Proof-of-Work + ZKP: Scanners solve a SHA-256-based Proof-of-Work and generate a Zero-Knowledge Proof using Circom and snarkjs.
- Reward Distribution: Valid reports with verified proofs are rewarded automatically with ETH via smart contract.

 ### Team Members
- Nethra Janardhanan : nethra.janardhanan-1@ou.edu
- Abirami Thiyagarajan: abirami.thiyagarajan-1@ou.edu
  
