import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const LOG_FILE = path.join("./backend", "report-log.json");


if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, "[]");
}

router.post("/", (req, res) => {
  try {
    const { cid, infoHash, filename, scanner } = req.body;

    if (!cid || !infoHash || !filename || !scanner) {
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

    currentData.push(newEntry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(currentData, null, 2));

    return res.json({ success: true, message: "Report appended" });
  } catch (err) {
    console.error("Error appending to report-log.json:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
    return res.json(data);
  } catch (err) {
    console.error("Error reading report-log.json:", err);
    return res.status(500).json({ error: "Failed to read report log" });
  }
});

export default router;
