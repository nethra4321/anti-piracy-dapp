const { ethers } = require("hardhat");
const hre = require("hardhat");
const path = require("path");
const fs = require("fs");
async function main() {
  const rewardAmount = ethers.parseEther("1");

  const RewardZKP = await ethers.getContractFactory("RewardZKP");
  const rewardZKP = await RewardZKP.deploy(rewardAmount);
  await rewardZKP.waitForDeployment();

  const deployedAddress = await rewardZKP.getAddress();
  console.log(`Deployed RewardZKP at: ${deployedAddress}`);

  fs.writeFileSync(
    path.join(__dirname, "reward-address.json"),
    JSON.stringify({ rewardZKP: deployedAddress }, null, 2)
  );

}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
