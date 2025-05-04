import express from "express";
import axios from "axios";
import WebTorrent from "webtorrent";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import { ethers } from "ethers";
import RewardZKPAbi from "./abis/rewardZKP.json" assert { type: 'json' };
import { startScanner } from "./scanner.js";

const app = express();
const client = new WebTorrent();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROVIDER_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY = "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897";
const rewardPath = path.join(__dirname, "..", "scripts", "reward-address.json");

const { rewardZKP: REWARDZKP_ADDRESS } = JSON.parse(
  fs.readFileSync(rewardPath, "utf8")
);

console.log("address",REWARDZKP_ADDRESS)

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const rewardZKP = new ethers.Contract(REWARDZKP_ADDRESS, RewardZKPAbi, signer);

app.use(cors());
app.use(express.json());

// Seed endpoint for seeding the file via web torrent and starts the Scanner
app.post("/api/seed", async (req, res) => {
  const { cid ,filename} = req.body;
 console.log("file_name",filename)
  if (!cid) return res.status(400).json({ message: "CID missing" });

  try {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const outputPath = path.join(__dirname, "downloaded", `${cid}.mp4`);
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const writer = fs.createWriteStream(outputPath);
    
    const response = await axios({ method: "GET", url, responseType: "stream" });
    response.data.pipe(writer);

    writer.on("finish", () => {
      client.seed(outputPath, (torrent) => {
        console.log("Torrent seeded with infoHash:", torrent.infoHash);
        res.status(200).json({
          infoHash: torrent.infoHash,
          magnetURI: torrent.magnetURI
        });
        startScanner(torrent.infoHash,cid,filename)
      });
    });

    writer.on("error", (err) => {
      console.error("File write error:", err);
      res.status(500).json({ message: "File write failed." });
    });
  } catch (err) {
    console.error("Download/Seed error:", err);
    res.status(500).json({ message: "Seeding failed." });
  }
});


const LOG_FILE = path.join(__dirname, "report-log.json");
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, "[]");
}

//report endpoint for sending the report to the report-log json file for report dashboard
app.post("/api/report", (req, res) => {
  try {
    const { cid, infoHash, scanner,filename } = req.body;
    if (!cid || !infoHash  || !scanner) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const currentData = JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
    const newEntry = {
      cid,
      infoHash,
      filename,
      scanner,
      timestamp: new Date().toISOString(),
    };
    console.log("newEntry",newEntry)
    currentData.push(newEntry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(currentData, null, 2));
    console.log("Report appended:", newEntry);
    return res.json({ success: true, message: "Report appended" });
  } catch (err) {
    console.error("Error appending to report-log.json:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/api/report", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
    return res.json(data);
  } catch (err) {
    console.error("Error reading report-log.json:", err);
    return res.status(500).json({ error: "Failed to read report log" });
  }
});
app.listen(5005, () => {
  console.log("Seed server running at http://localhost:5005");
});