const hre = require ('hardhat');

/** Set contract name and collection name */
const CONTRACT_NAME = 'TierNFT'
const COLLECTION_NAME = 'TierNFT'
const COLLECTION_SYMBOL = 'TIER'

async function main() {
    const contractFactory = await hre.ethers.getContractFactory(CONTRACT_NAME)
    const contract = await contractFactory.deploy(
        COLLECTION_NAME, 
        COLLECTION_SYMBOL
    )

    await contract.waitForDeployment()
    console.log("Contract deployed at ", await contract.getAddress())
}

main().catch((error) => {
    console.error(error)
    process.exit(1) 
})