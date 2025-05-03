const { ethers } = require("hardhat");
const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  // Load deployed PiracyGuard and RewardZKP addresses
  const piracyGuardAddr = JSON.parse(fs.readFileSync("./scripts/deploy-address.json", "utf8")).deploy;
  const rewardZkpAddr = JSON.parse(fs.readFileSync("./scripts/reward-address.json", "utf8")).rewardZKP;

  console.log("Deploying PiracyCoordinator with:");
  console.log("PiracyGuard address:", piracyGuardAddr);
  console.log("RewardZKP address:", rewardZkpAddr);

  const Coordinator = await ethers.getContractFactory("PiracyCoordinator");
  const coordinator = await Coordinator.deploy(piracyGuardAddr, rewardZkpAddr);
  await coordinator.waitForDeployment();

  const deployedAddress = await coordinator.getAddress();
  console.log("PiracyCoordinator deployed to:", deployedAddress);

  fs.writeFileSync(
    "./scripts/coordinator-address.json",
    JSON.stringify({ coordinator: deployedAddress }, null, 2)
  );

  const artifact = await hre.artifacts.readArtifact("PiracyCoordinator");
  const backendAbiPath = path.join("backend", "abis", "PiracyCoordinator.json");
  fs.writeFileSync(backendAbiPath, JSON.stringify(artifact.abi, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
