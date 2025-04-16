import React from "react";
import IPFSUploader from "./ipfsuploader";

function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Decentralized Anti-Piracy System</h1>
      <IPFSUploader />
    </div>
  );
}

export default App;
