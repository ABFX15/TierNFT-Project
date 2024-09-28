const { expect } = require("chai");

const CONTRACT_NAME = "TierNFT";
const COLLECTION_NAME = "TierNFT";
const COLLECTION_SYMBOL = "Tier";

describe("TierNFT", function () {
  let contract;
  let owner;
  let otherUser;

  beforeEach(async function () {
    const Contract = await hre.ethers.getContractFactory(CONTRACT_NAME);

    const [_owner, _otherUser] = await hre.ethers.getSigners();
    owner = _owner;
    otherUser = _otherUser;

    contract = await Contract.deploy(COLLECTION_NAME, COLLECTION_SYMBOL);
    await contract.waitForDeployment();
  });

  describe("constructor", async () => {
    it("set proper collection name", async function () {
      const name = await contract.name();
      expect(name).to.equal("TierNFT");
    });

    it("set proper collection symbol", async function () {
      const symbol = await contract.symbol();
      expect(symbol).to.equal("Tier");
    });
  });

  describe("mint", async () => {
    it("should not mint if value is below the minimum tier", async function () {
      await expect(
        contract.mint({
          value: hre.ethers.parseEther("0.001"),
        }),
      ).to.be.revertedWithCustomError(contract, "TIER__NOT_ENOUGH_VALUE_FOR_MINIMUM");
      await expect(await contract.totalSupply()).to.equal(0);
    });
  
    it("should increase total supply", async function () {
      await contract.mint({
        value: hre.ethers.parseEther("0.01"),
      });
      await expect(await contract.totalSupply()).to.equal(1);
    });
  
    it("should mint Tier 0", async function () {
      await contract.mint({
        value: hre.ethers.parseEther("0.01"),
      });
      await expect(await contract.tokenTier(1)).to.equal(0);
    });
  
    it("should mint Tier 1", async function () {
      await contract.mint({
        value: hre.ethers.parseEther("0.02"),
      });
      await expect(await contract.tokenTier(1)).to.equal(1);
    });
  
    it("should mint Tier 2", async function () {
      await contract.mint({
        value: hre.ethers.parseEther("0.05"),
      });
      await expect(await contract.tokenTier(1)).to.equal(2);
    });

  });
  describe("withdrawal", async () => {
    it("should error if not owner", async function () {
      await expect(contract.connect(otherUser).withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  
    it("should error if balance is zero", async function () {
      await expect(contract.withdraw()).to.be.revertedWithCustomError(contract, "BALANCE__ZERO_BALANCE");
    });
  
    it("should success if owner", async function () {
      await contract.mint({
        value: hre.ethers.parseEther("0.01"),
      });
      expect(await hre.ethers.provider.getBalance(contract.getAddress())).to.equal(
        hre.ethers.parseEther("0.01"),
      );
      await contract.withdraw();
      expect(await hre.ethers.provider.getBalance(contract.getAddress())).to.equal(
        hre.ethers.parseEther("0"),
      );
    });
  });
}); 