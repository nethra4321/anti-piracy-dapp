const hre = require("hardhat");

async function main() {
  const PiracyGuard = await hre.ethers.getContractFactory("PiracyGuard");
  const contract = await PiracyGuard.deploy(); // deploys to local node

  await contract.waitForDeployment(); // ✅ CORRECT in Hardhat v2.20+
  const address = await contract.getAddress();

  console.log("✅ PiracyGuard deployed at:", address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
