# Decentralized Anti-Piracy System

This project addresses the growing challenge of digital piracy by combining decentralized technologies: Ethereum smart contracts, IPFS, BitTorrent, and zero-knowledge proofs (ZKPs). It allows creators to register original content immutably, enables decentralized detection by peers and rewards verifiable piracy reports using a trustless proof mechanism.

## Folder Structure
BLOCKCHAIN_PROJECT/
backend/           
frontend/     
contracts/         
circuits/           
circom/           
scripts/            
artifacts/, cache/    
node_modules/       
.gitignore            
hardhat.config.js      
package.json         

## Project Setup Guide

### Pre-requisites
Node.js v16+  
Hardhat  
Metamask  
Cargo  
Rust  
Circom  
SnarkJS  

### Smart Contract Deployment

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

### Terminal 3 – Start frontend
``` bash
cd frontend  
npm run dev
```
### Terminal 3 – Start Backend express server
``` bash
cd backend  
npm run dev
```
### Terminal 4 - Fund Reward contract with ETH
``` bash
cd backend  
node fundContract.js
```
