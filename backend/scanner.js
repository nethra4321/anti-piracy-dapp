import DHT from "bittorrent-dht";
import crypto from "crypto";
import axios from "axios";
import fs from "fs";
import { Worker } from "worker_threads";
import { groth16 } from "snarkjs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { ethers } from "ethers";
import PiracyCoordinatorAbi from "./abis/piracyCoordinator.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load deployed PiracyCoordinator contract address
const { coordinator: coordAddress } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "scripts", "coordinator-address.json"), "utf8")
);
// Set up Ethers provider and signer with private key for sending transactions
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const PRIVATE_KEY = "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61";
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Load scanning wallets from JSON file
const wallets = JSON.parse(fs.readFileSync("./wallets.json", "utf8"));
let globalStop = false;

// Starts the scanner on all wallets for the given torrent infohash, IPFS CID and filename
export function startScanner(infoHash,cid,filename) {
  wallets.forEach((walletInfo, index) => {
    const wallet = walletInfo.wallet;
    const port = 20000 + index;
    const dht = new DHT();

    dht.listen(port, () => {
      console.log(`[Wallet ${index}] DHT listening on port ${port}`);
      dht.lookup(infoHash); // This searches for peers matching this infoHash
    });

    runPowWorker(wallet, infoHash, index, dht,cid,filename);
  });
}
 // Worker logic to find a nonce that produces a SHA-256 hash with required leading zeros
function runPowWorker(wallet, infoHash, index, dht,cid,filename) {
  let alreadyWorking = false;
  const difficulty = 5;

  dht.on("peer", (peer) => {
    if (alreadyWorking || globalStop) return;
    alreadyWorking = true;

    console.log(`[Wallet ${index}] Found peer:`, peer);
    console.log(`wallet: ${wallet}, infoHash: ${infoHash}`);

    const worker = new Worker(`
      const { parentPort, workerData } = require("worker_threads");
      const crypto = require("crypto");

      function buildPreimage(infoHashHex, walletHex, nonce) {
        const buffer = Buffer.alloc(64);
        Buffer.from(infoHashHex, "hex").copy(buffer, 0);        // 32 bytes
        Buffer.from(walletHex.slice(2), "hex").copy(buffer, 32); // 20 bytes
        buffer.writeUInt32BE(nonce, 52);                         // 4 bytes
        return buffer;
      }

      function sha256Bits(buffer) {
        const hash = crypto.createHash("sha256").update(buffer).digest();
        return Array.from(hash).flatMap(byte =>
          [7,6,5,4,3,2,1,0].map(i => (byte >> i) & 1)
        );
      }

      function findNonce(infoHash, wallet, difficulty) {
        let nonce = 0;
        while (true) {
          const preimage = buildPreimage(infoHash, wallet, nonce);
          const bits = sha256Bits(preimage);

          let zeroBits = 0;
          for (let i = 0; i < bits.length; i++) {
            if (bits[i] === 0) zeroBits++;
            else break;
          }

          if (zeroBits >= difficulty) {
            const hashHex = crypto.createHash("sha256").update(preimage).digest("hex");
            console.log('PoW solved!');
            console.log("Found nonce:", nonce);
            console.log("Corresponding hash:", hashHex);
            parentPort.postMessage({ nonce });
            return;
          }

          nonce++;
          if (nonce % 100000 === 0 && workerData.globalStop){
           globalStop = true;
           return;
          } 
        }
        
      }

      findNonce(workerData.infoHash, workerData.wallet, workerData.difficulty);
    `, {
      eval: true,
      workerData: {
        infoHash,
        wallet,
        difficulty,
        globalStop
      }
    });

    worker.on("message", async ({ nonce }) => {
      if (nonce != null && !globalStop) {
        globalStop = true;
        const preimageBuffer = buildPreimage(infoHash, wallet, nonce);
        const preimageHex = preimageBuffer.toString("hex");
        const preimageBits = hexToBits(preimageHex, 512);


        const actualInfoHash = crypto.createHash("sha256").update(preimageBuffer).digest("hex");
        const paddedInfoHash = padToBytes32(actualInfoHash);

        // console.log(`[Wallet ${index}] Preimage hex: ${preimageHex}`);


        try {
          const input = { preimage: preimageBits };
          // Generate proof using snarkjs and Groth16 proving system
          const { proof, publicSignals } = await groth16.fullProve(
            input,
            "../circuits/powproof_js/powproof.wasm",
            "../circuits/powproof_final.zkey"
          );
          console.log(`[Wallet ${index}] Proof generated`);
          //verifying the proof
          const vKey = JSON.parse(fs.readFileSync("../circuits/verification_key.json", "utf8"));
          const verified = await groth16.verify(vKey, publicSignals, proof);
          console.log("Local Verification:", verified);
    
          if (!verified) {
            console.error("Proof failed local verification. Skipping contract call.");
            return;
          }
          const coordinator = new ethers.Contract(
            coordAddress,
            PiracyCoordinatorAbi,
            signer
          );

          const normalizedWallet = ethers.getAddress(wallet);

          const balanceBefore = await provider.getBalance(normalizedWallet);
          console.log(`[Wallet ${index}] Balance before:`, balanceBefore.toString());
          const tx = await coordinator.reportPiracy(normalizedWallet, paddedInfoHash, cid);
          await tx.wait();

          console.log(`[Wallet ${index}] Reported piracy successfully!`);
          const balanceAfter = await provider.getBalance(normalizedWallet);

          console.log(`[Wallet ${index}] Balance after:`, balanceAfter.toString());
          const diff = balanceAfter - balanceBefore;
          console.log(`[Wallet ${index}] Reward earned: ${diff.toString()} wei`);
          console.log(wallet+ " Rewarded successfully!");
          await axios.post("http://localhost:5005/api/report", {
            cid,
            infoHash: paddedInfoHash,
            filename:filename,
            scanner: wallet
          });

          console.log(`[Wallet ${index}] Report success`);
        } catch (err) {
          console.error(`[Wallet ${index}] Report failed:`, err.response?.data || err.message);
        } finally {
          worker.terminate();
          dht.destroy(() => {
            console.log(`[Wallet ${index}] Scanner stopped.`);
          });
        }
      }
    });

    worker.on("error", (err) => {
      console.error(`[Wallet ${index}] Worker error:`, err);
      worker.terminate();
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`[Wallet ${index}] Worker stopped with exit code ${code}`);
      }
    });
  });
}

function buildPreimage(infoHashHex, walletHex, nonce) {
  const buffer = Buffer.alloc(64);
  Buffer.from(infoHashHex, "hex").copy(buffer, 0);
  Buffer.from(walletHex.slice(2), "hex").copy(buffer, 32);
  buffer.writeUInt32BE(nonce, 52);
  return buffer;
}
function padToBytes32(hex) {
  if (hex.startsWith("0x")) hex = hex.slice(2);
  return "0x" + hex.padStart(64, "0");
}

function hexToBits(hexStr, bitLength) {
  const bits = [];
  for (let i = 0; i < hexStr.length; i++) {
    const nibble = parseInt(hexStr[i], 16);
    for (let j = 3; j >= 0; j--) {
      bits.push((nibble >> j) & 1);
    }
  }
  while (bits.length < bitLength) {
    bits.push(0);
  }
  return bits.slice(0, bitLength);
}
