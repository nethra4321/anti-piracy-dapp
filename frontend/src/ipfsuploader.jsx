import React, { useState } from "react";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { BrowserProvider, Contract } from "ethers";
import abi from "./PiracyGuardABI.json";


const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

//developing metamask 
export default function IPFSUploader() {
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
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (err) {
      console.error(err);
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
            <a href={`https://ipfs.io/ipfs/${ipfsCid}`} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd" }}>
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
