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
pot18_final.ptau 
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
### Terminal 5 -  ZKP Compilation & Setup (Groth16)
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
