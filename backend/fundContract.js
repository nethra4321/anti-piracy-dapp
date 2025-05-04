import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const PROVIDER_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897"; // used account 10
// const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";



const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const rewardPath = path.join(__dirname, "..", "scripts", "reward-address.json");
const { rewardZKP: CONTRACT_ADDRESS } = JSON.parse(
  fs.readFileSync(rewardPath, "utf8")
);

async function fundContract() {
  const tx = await signer.sendTransaction({
    to: CONTRACT_ADDRESS,
    value: ethers.parseEther("50"), 
  });

  await tx.wait();
  const balance = await provider.getBalance(CONTRACT_ADDRESS);
  console.log("Contract balance:", ethers.formatEther(balance));
  console.log(`Contract funded with 50 ETH: ${tx.hash}`);
}

fundContract().catch(console.error);
