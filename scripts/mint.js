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
  // Print our newly deployed contract address
  console.log("Attached contract ", await contract.getAddress());


  let txn = await contract.mint({
    value: hre.ethers.parseEther(VALUE_TIER_0),
  });
  await txn.wait(); // Wait for the NFT to be minted
  console.log("Minted a Tier 0 NFT!");

  txn = await contract.mint({
    value: hre.ethers.parseEther(VALUE_TIER_1),
  });
  await txn.wait(); 
  console.log("Minted a Tier 1 NFT!");

  
  txn = await contract.mint({
    value: hre.ethers.parseEther(VALUE_TIER_2),
  });
  await txn.wait(); 
  console.log("Minted a Tier 2 NFT!");

  // Print total number of minted NFTs
  let totalSupply = await contract.totalSupply();
  console.log("Collection's new totalSupply: ", totalSupply);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
