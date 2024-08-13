import { ethers } from 'hardhat';

async function main() {
  const provider = ethers.provider;
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  const usdcContract = await ethers.getContractFactory("USDC");
  const usdc = await usdcContract.deploy(signerAddress, "USDC Coin", "USDC");
  await usdc.waitForDeployment();

  console.log("USDC deployed at " + usdc.target);

  const realEstateNFTContract = await ethers.getContractFactory("RealEstateNFT");
  const realEstateNFT = await realEstateNFTContract.deploy(usdc.target, 0, "https://example.com/");
  await realEstateNFT.waitForDeployment();

  console.log("realEstateNFT deployed at " + realEstateNFT.target);

  const realEstateStakingContract = await ethers.getContractFactory("RealEstateStaking");
  const realEstateStaking = await realEstateStakingContract.deploy(24 * 60 * 60, signerAddress, 0, realEstateNFT.target, usdc.target, "0x4200000000000000000000000000000000000006");
  await realEstateStaking.waitForDeployment();

  console.log("realEstateStaking deployed at " + realEstateStaking.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);

  process.exitCode = 1;
});
