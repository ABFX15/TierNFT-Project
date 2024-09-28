const hre = require("hardhat");

/** Set contract and collection name **/
const CONTRACT_NAME = "TierNFT";
const CONTRACT_ADDRESS = "0x7173c8Ac66F795B38E20952d7e94E6EB793CA347";
const VALUE_TIER_0 = "0.01"; // in ethers/matic
const VALUE_TIER_1 = "0.02"; // in ethers/matic
const VALUE_TIER_2 = "0.05"; // in ethers/matic

/** Main deploy function **/
async function main() {
  const contractFactory = await hre.ethers.getContractFactory(CONTRACT_NAME);
  const contract = await contractFactory.attach(CONTRACT_ADDRESS);
  console.log("Attached contract ", await contract.getAddress());

  try {
    // Mint Tier 0
    let txn = await contract.mint({ value: hre.ethers.parseEther(VALUE_TIER_0) });
    await txn.wait();
    console.log("Minted a Tier 0 NFT!");
    
    // Mint Tier 1
    txn = await contract.mint({ value: hre.ethers.parseEther(VALUE_TIER_1) });
    await txn.wait();
    console.log("Minted a Tier 1 NFT!");
    
    // Mint Tier 2
    txn = await contract.mint({ value: hre.ethers.parseEther(VALUE_TIER_2) });
    await txn.wait();
    console.log("Minted a Tier 2 NFT!");
    
    // Get total supply
    let totalSupply = await contract.totalSupply();
    console.log("Collection's new totalSupply: ", totalSupply);
  } catch (error) {
    console.error("Error during minting:", error.message);
    console.error(error.data);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
