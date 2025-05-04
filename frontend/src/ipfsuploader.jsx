import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { BrowserProvider, Contract } from "ethers";
import abi from "./PiracyGuardABI.json";
import axios from "axios";


const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZTkzMTVhMS02NjJkLTRkODAtYmQ0ZC03NzQ2Y2ZjMDE4ZGEiLCJlbWFpbCI6Im5ldGhyYWphbmE3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJiZTkxZTA5ZjExNWQ5Y2U0MTVlZCIsInNjb3BlZEtleVNlY3JldCI6IjIxM2EyMjI0ZDgzZWJjZDM1OGE1ODU3NTk3OWM5MTEyNjRkYzY3MTVkYThmMjY2MWMyZDI4ZTRmNzY0OTBmOGIiLCJleHAiOjE3NzY0MDUzODh9.c4bZ7afGAq4M01r6RmLjPholV27J47NrBTIBzVop-Cc";


//developing metamask 
export default function IPFSUploader() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [ipfsCid, setIpfsCid] = useState("");
  const [wallet, setWallet] = useState("Not connected");
  const [txHash, setTxHash] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return;
  
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
  
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
  
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
  
      if (Number(network.chainId) !== 31337) return;
  
      setWallet(accounts[0]);
    //   setShowPopup(true);
    //   setTimeout(() => setShowPopup(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadToIPFS = async () => {
    if (!file) return alert("Choose a file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          Authorization: JWT,
        },
      });

      const cid = res.data.IpfsHash;
      setIpfsCid(cid);
      alert("File uploaded to IPFS");
    } catch (err) {
      if (err.response) {
        console.error("Pinata Upload Error:", err.response.data);
      } else {
        console.error("Pinata Upload Error:", err.message);
      }
      alert("Upload failed. Check console for details.");
    }
  };
  const registerContent = async () => {
    if (!ipfsCid) {
      alert("Upload a file to IPFS first.");
      return;
    }
  
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, abi, signer);
  
      const tx = await contract.registerContent(ipfsCid);
      await tx.wait();
  
      setTxHash(tx.hash);
      alert("Content registered on blockchain");
      console.log("Transaction hash:", tx.hash);
      await sendToBackend();
    } catch (err) {
      console.error("Smart contract registration error:", err);
      alert("Failed to register content on blockchain.");
    }
  };
  const sendToBackend = async () => {
    try {
      console.log(file.name, ipfsCid)
      const res = await axios.post("http://localhost:5005/api/seed", {
        cid: ipfsCid,
        filename: file.name,
      });
      console.log("Backend response:", res.data);
      console.log(`Seeding started..\nInfoHash: ${res.data.infoHash}`);
    } catch (err) {
      console.error("Backend Seed Error:", err.response?.data || err.message);
      alert("Failed to send CID to backend.");
    }
  };
  

  return (
    <div style={{
      maxWidth: "600px",
      margin: "40px auto",
      padding: "2rem",
      backgroundColor: "#1e1e1e",
      color: "#f9f9f9",
      borderRadius: "12px",
      fontFamily: "Arial, sans-serif",
      boxShadow: "0 0 12px rgba(255, 255, 255, 0.1)"
    }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "1rem" }}>
        Decentralized Anti-Piracy System
      </h1>
      <button
      onClick={() => navigate("/dashboard")}
      style={{
       padding: "10px 20px",
       backgroundColor: "#4ade80",
       color: "white",
       border: "none",
       borderRadius: "8px",
       cursor: "pointer",
       marginLeft: "10px",
      marginBottom: "10px"
    }}
    >
     View Dashboard
   </button>

      <h2 style={{ marginBottom: "1rem" }}>Upload and Register File</h2>

      <button
        onClick={connectWallet}
        style={{ padding: "10px 20px", backgroundColor: "#facc15", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "10px" }}
      >
        Connect MetaMask
      </button>

      <p><strong>Wallet:</strong> {wallet}</p>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <input type="file" onChange={handleFileChange} />
        <button
          onClick={uploadToIPFS}
          style={{ padding: "8px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Upload to IPFS
        </button>
      </div>

      {ipfsCid && (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>IPFS CID:</strong> {ipfsCid}</p>
          <p>
            <a href={`https://gateway.pinata.cloud/ipfs/${ipfsCid}`} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd" }}>
              View on IPFS
            </a>
          </p>
          <button
            onClick={registerContent}
            style={{ padding: "8px 16px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Register on Blockchain
          </button>
        </div>
      )}

      {txHash && (
        <p style={{ marginTop: "10px" }}>
          Transaction:{" "}
          <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4ade80" }}>
            {txHash}
          </a>
        </p>
      )}
    </div>
  );
}
