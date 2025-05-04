import { useEffect, useState } from "react";
import axios from "axios";

export default function Report() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5005/api/report")
      .then((res) => setReports(res.data))
      .catch((err) => console.error("Failed to fetch reports:", err));
  }, []);

  return (
    <div style={{
      maxWidth: "90%",
      margin: "40px auto",
      padding: "2rem",
      backgroundColor: "#1f2937",
      color: "#f9fafb",
      fontFamily: "Arial, sans-serif",
      borderRadius: "12px",
      boxShadow: "0 0 10px rgba(255,255,255,0.05)"
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>
        Piracy Reports
      </h1>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
      }}>
        <thead style={{ backgroundColor: "#374151" }}>
          <tr>
            <th style={thStyle}>File Name</th>
            <th style={thStyle}>IPFS CID</th>
            <th style={thStyle}>InfoHash</th>
            <th style={thStyle}>Scanner Wallet</th>
            <th style={thStyle}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #4b5563" }}>
              <td style={tdStyle}>{r.filename || "N/A"}</td>
              <td style={tdStyle}> {r.cid}</td>
              <td style={tdStyle}>{r.infoHash}</td>
              <td style={tdStyle}>{r.scanner}</td>
              <td style={tdStyle}>{new Date(r.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "12px",
  borderBottom: "2px solid #6b7280",
  fontWeight: "bold",
  fontSize: "0.95rem"
};

const tdStyle = {
  padding: "10px",
  fontSize: "0.9rem",
  color: "#d1d5db",
  wordBreak: "break-all"
};
