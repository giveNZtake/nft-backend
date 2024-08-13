import { ethers } from 'hardhat';

async function main() {
  const provider = ethers.provider;
  const [signer, user1, user2, user3, user4] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  const user1Address = await user1.getAddress();
  const user2Address = await user2.getAddress();

  const usdcContract = await ethers.getContractFactory("USDC");
  const usdc = await usdcContract.deploy(signerAddress, "USDC Coin", "USDC");

  await usdc.waitForDeployment();

  const decimals = await usdc.decimals();
  await (await usdc.mintTo(user1Address, ethers.parseUnits("100000", decimals))).wait();

  console.log("User1 has " + ethers.formatUnits(await usdc.balanceOf(user1Address), decimals) + "USDC");

  const realEstateNFTContract = await ethers.getContractFactory("RealEstateNFT");
  const realEstateNFT = await realEstateNFTContract.deploy(usdc.target, 0, "https://example.com/");
  await realEstateNFT.waitForDeployment();

  await (await usdc.connect(user1).approve(await realEstateNFT.getAddress(), ethers.MaxUint256)).wait();
  await (await realEstateNFT.connect(user1).mintTo(user1Address, 0, "", 1)).wait();
  await (await realEstateNFT.connect(user1).mintTo(user1Address, 1, "", 2)).wait();
  
  console.log("User1 has " + (await realEstateNFT.balanceOf(user1Address, 0)) + " Diamond NFTs");
  console.log("User1 has " + (await realEstateNFT.balanceOf(user1Address, 1)) + " Gold NFTs");

  const realEstateStakingContract = await ethers.getContractFactory("RealEstateStaking");
  const realEstateStaking = await realEstateStakingContract.deploy(24 * 60 * 60, signerAddress, 0, realEstateNFT.target, usdc.target, "0x4200000000000000000000000000000000000006");
  await realEstateStaking.waitForDeployment();

  await (await realEstateNFT.connect(user1).setApprovalForAll(realEstateStaking.target, true)).wait();
  await (await realEstateStaking.connect(user1).stake(0, 1)).wait();
  await (await realEstateStaking.connect(user1).stake(1, 2)).wait();

  console.log("Staking contract has " + await realEstateStaking.getStakeInfo(user1));

  {
    const calls = [
      realEstateStaking.interface.encodeFunctionData("setRewardsPerUnitTime", [0, ethers.parseUnits("50", decimals)]),
      realEstateStaking.interface.encodeFunctionData("setRewardsPerUnitTime", [1, ethers.parseUnits("20", decimals)]),
      realEstateStaking.interface.encodeFunctionData("setRewardsPerUnitTime", [2, ethers.parseUnits("10", decimals)]),
      realEstateStaking.interface.encodeFunctionData("setRewardsPerUnitTime", [3, ethers.parseUnits("2", decimals)]),
    ];
    await (await realEstateStaking.multicall(calls)).wait();
  }

  await (await usdc.mintTo(signerAddress, ethers.parseUnits("1000", decimals))).wait();
  await (await usdc.approve(await realEstateStaking.getAddress(), ethers.MaxUint256)).wait();
  await (await realEstateStaking.depositRewardTokens(ethers.parseUnits("1000", decimals))).wait();
  console.log("Staking has " + ethers.formatUnits(await usdc.balanceOf(realEstateStaking.target), decimals) + "USDC");

  {
    // Get the current timestamp
    const currentBlock = await provider.getBlock('latest');
    if(!currentBlock) return;
    console.log("Current timestamp:", currentBlock.timestamp);

    // Set a new timestamp (e.g., 1 day later)
    const newTimestamp = currentBlock.timestamp + 86400; // 86400 seconds = 1 day
    await provider.send("evm_setNextBlockTimestamp", [newTimestamp]);
    await provider.send("evm_mine", []);

    // Verify the new timestamp
    const newBlock = await provider.getBlock('latest');
    if(!newBlock) return;
    console.log("New block timestamp:", newBlock.timestamp);
  }

  console.log("Staking contract has USDC " + ethers.formatUnits(await realEstateStaking.getRewardTokenBalance(), decimals));
  console.log("Staking contract has owed " + await realEstateStaking.getStakeInfo(user1));

  await (await realEstateStaking.connect(user1).batchClaimRewards([0, 1, 2, 3])).wait();

  console.log("Staking contract has owed" + await realEstateStaking.getStakeInfo(user1));
  console.log("User1 has " + (await usdc.balanceOf(user1Address)));

  {
    const calls = [
      realEstateStaking.interface.encodeFunctionData("setRewardsPerUnitTime", [0, ethers.parseUnits("100", decimals)]),
      realEstateStaking.interface.encodeFunctionData("setRewardsPerUnitTime", [1, ethers.parseUnits("40", decimals)]),
      realEstateStaking.interface.encodeFunctionData("setRewardsPerUnitTime", [2, ethers.parseUnits("20", decimals)]),
      realEstateStaking.interface.encodeFunctionData("setRewardsPerUnitTime", [3, ethers.parseUnits("4", decimals)]),
    ];
    await (await realEstateStaking.multicall(calls)).wait();
  }

  {
    // Get the current timestamp
    const currentBlock = await provider.getBlock('latest');
    if(!currentBlock) return;
    console.log("Current timestamp:", currentBlock.timestamp);

    // Set a new timestamp (e.g., 1 day later)
    const newTimestamp = currentBlock.timestamp + 86400; // 86400 seconds = 1 day
    await provider.send("evm_setNextBlockTimestamp", [newTimestamp]);
    await provider.send("evm_mine", []);

    // Verify the new timestamp
    const newBlock = await provider.getBlock('latest');
    if(!newBlock) return;
    console.log("New block timestamp:", newBlock.timestamp);
  }

  console.log("Staking contract has USDC " + ethers.formatUnits(await realEstateStaking.getRewardTokenBalance(), decimals));
  console.log("Staking contract has owed " + await realEstateStaking.getStakeInfo(user1));

  await (await realEstateStaking.connect(user1).batchClaimRewards([0, 1, 2, 3])).wait();

  console.log("Staking contract has owed " + await realEstateStaking.getStakeInfo(user1));
  console.log("User1 has " + (await usdc.balanceOf(user1Address)));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);

  process.exitCode = 1;
});
