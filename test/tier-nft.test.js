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
  describe('tokenURI and helpers', async () => {
    it('should error if token does not exist', async function () {
      await expect(contract.tokenURI(0)).to.be.revertedWithCustomError(contract, 'TOKEN__TOKEN_DOES_NOT_EXIST')
    })
  })

    describe('tierNameOf', async function () {
      it('should return proper tier name for Tier 0', async function () {
        await expect(await contract.tierNameOf(0)).to.equal('Basic')
      })
      it('should return proper tier name for Tier 1', async function () {
        await expect(await contract.tierNameOf(1)).to.equal('Medium')
      })
      it('should return proper tier name for Tier 2', async function () {
        await expect(await contract.tierNameOf(2)).to.equal('Premium')
      })
      it('should return Tier 2 name if tier number greater than all tiers', async function () {
        await expect(await contract.tierNameOf(999)).to.equal('Premium')
      })
    })

    describe('imageSVGOf', async function () {
      it('should return proper imageSVG for Tier 0', async function () {
        await expect(await contract.imageSVGOf(0)).to.equal(
          '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" fill="none" font-family="sans-serif"><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="500" width="500"><feDropShadow dx="1" dy="2" stdDeviation="8" flood-opacity=".67" width="200%" height="200%" /></filter><linearGradient id="B" x1="0" y1="0" x2="15000" y2="0" gradientUnits="userSpaceOnUse"><stop offset=".05" stop-color="#ad00ff" /><stop offset=".23" stop-color="#4e00ec" /><stop offset=".41" stop-color="#ff00f5" /><stop offset=".59" stop-color="#e0e0e0" /><stop offset=".77" stop-color="#ffd810" /><stop offset=".95" stop-color="#ad00ff" /></linearGradient><linearGradient id="C" x1="0" y1="60" x2="0" y2="110" gradientUnits="userSpaceOnUse"><stop stop-color="#d040b8" /><stop offset="1" stop-color="#e0e0e0" /></linearGradient></defs><path fill="url(#B)" d="M0 0h15000v500H0z"><animateTransform attributeName="transform" attributeType="XML" type="translate" from="0 0" to="-14500 0" dur="16s" repeatCount="indefinite" /></path><circle fill="#1d1e20" cx="100" cy="90" r="45" filter="url(#A)" /><text x="101" y="99" text-anchor="middle" class="nftLogo" font-size="32px" fill="url(#C)" filter="url(#A)">D_D<animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 100 90" to="360 100 90" dur="5s" repeatCount="indefinite" /></text><g font-size="32" fill="#fff" filter="url(#A)"><text x="250" y="280" text-anchor="middle" class="tierName">Basic</text></g></svg>',
        )
      })
      it('should return proper imageSVG for Tier 1', async function () {
        await expect(await contract.imageSVGOf(1)).to.equal(
          '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" fill="none" font-family="sans-serif"><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="500" width="500"><feDropShadow dx="1" dy="2" stdDeviation="8" flood-opacity=".67" width="200%" height="200%" /></filter><linearGradient id="B" x1="0" y1="0" x2="15000" y2="0" gradientUnits="userSpaceOnUse"><stop offset=".05" stop-color="#ad00ff" /><stop offset=".23" stop-color="#4e00ec" /><stop offset=".41" stop-color="#ff00f5" /><stop offset=".59" stop-color="#e0e0e0" /><stop offset=".77" stop-color="#ffd810" /><stop offset=".95" stop-color="#ad00ff" /></linearGradient><linearGradient id="C" x1="0" y1="60" x2="0" y2="110" gradientUnits="userSpaceOnUse"><stop stop-color="#d040b8" /><stop offset="1" stop-color="#e0e0e0" /></linearGradient></defs><path fill="url(#B)" d="M0 0h15000v500H0z"><animateTransform attributeName="transform" attributeType="XML" type="translate" from="0 0" to="-14500 0" dur="16s" repeatCount="indefinite" /></path><circle fill="#1d1e20" cx="100" cy="90" r="45" filter="url(#A)" /><text x="101" y="99" text-anchor="middle" class="nftLogo" font-size="32px" fill="url(#C)" filter="url(#A)">D_D<animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 100 90" to="360 100 90" dur="5s" repeatCount="indefinite" /></text><g font-size="32" fill="#fff" filter="url(#A)"><text x="250" y="280" text-anchor="middle" class="tierName">Medium</text></g></svg>',
        )
      })
      it('should return proper imageSVG for Tier 2', async function () {
        await expect(await contract.imageSVGOf(2)).to.equal(
          '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" fill="none" font-family="sans-serif"><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="500" width="500"><feDropShadow dx="1" dy="2" stdDeviation="8" flood-opacity=".67" width="200%" height="200%" /></filter><linearGradient id="B" x1="0" y1="0" x2="15000" y2="0" gradientUnits="userSpaceOnUse"><stop offset=".05" stop-color="#ad00ff" /><stop offset=".23" stop-color="#4e00ec" /><stop offset=".41" stop-color="#ff00f5" /><stop offset=".59" stop-color="#e0e0e0" /><stop offset=".77" stop-color="#ffd810" /><stop offset=".95" stop-color="#ad00ff" /></linearGradient><linearGradient id="C" x1="0" y1="60" x2="0" y2="110" gradientUnits="userSpaceOnUse"><stop stop-color="#d040b8" /><stop offset="1" stop-color="#e0e0e0" /></linearGradient></defs><path fill="url(#B)" d="M0 0h15000v500H0z"><animateTransform attributeName="transform" attributeType="XML" type="translate" from="0 0" to="-14500 0" dur="16s" repeatCount="indefinite" /></path><circle fill="#1d1e20" cx="100" cy="90" r="45" filter="url(#A)" /><text x="101" y="99" text-anchor="middle" class="nftLogo" font-size="32px" fill="url(#C)" filter="url(#A)">D_D<animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 100 90" to="360 100 90" dur="5s" repeatCount="indefinite" /></text><g font-size="32" fill="#fff" filter="url(#A)"><text x="250" y="280" text-anchor="middle" class="tierName">Premium</text></g></svg>',
        )
      })
    })

    describe('finalJSON', async function () {
      it('should return proper finalJSON for Tier 0', async function () {
        await expect(
          await contract.finalJSON('TierNFT', 111, 'IMAGE_SVG_BASE64_HERE', 0),
        ).to.equal(
          '{"name": "TierNFT #111", "description": "TierNFTs collection", "image": "data:image/svg+xml;base64,IMAGE_SVG_BASE64_HERE","attributes":[{"trait_type": "Tier", "value": "Basic" }]}',
        )
      })

      it('should return proper finalJSON for Tier 1', async function () {
        await expect(
          await contract.finalJSON('TierNFT', 222, 'IMAGE_SVG_BASE64_HERE', 1),
        ).to.equal(
          '{"name": "TierNFT #222", "description": "TierNFTs collection", "image": "data:image/svg+xml;base64,IMAGE_SVG_BASE64_HERE","attributes":[{"trait_type": "Tier", "value": "Medium" }]}',
        )
      })

      it('should return proper finalJSON for Tier 2', async function () {
        await expect(
          await contract.finalJSON('TierNFT', 333, 'IMAGE_SVG_BASE64_HERE', 2),
        ).to.equal(
          '{"name": "TierNFT #333", "description": "TierNFTs collection", "image": "data:image/svg+xml;base64,IMAGE_SVG_BASE64_HERE","attributes":[{"trait_type": "Tier", "value": "Premium" }]}',
        )
      })
    })

    it('should return base64-encoded data for tokenURI for Tier 0', async function () {
      await contract.mint({
        value: hre.ethers.parseEther('0.01'),
      })
      await expect(await contract.tokenURI(1)).to.equal(
          'data:application/json;base64,eyJuYW1lIjogIlRpZXJORlQgIzEiLCAiZGVzY3JpcHRpb24iOiAiVGllck5GVHMgY29sbGVjdGlvbiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSGRwWkhSb1BTSTFNREFpSUdobGFXZG9kRDBpTlRBd0lpQm1hV3hzUFNKdWIyNWxJaUJtYjI1MExXWmhiV2xzZVQwaWMyRnVjeTF6WlhKcFppSStQR1JsWm5NK1BHWnBiSFJsY2lCcFpEMGlRU0lnWTI5c2IzSXRhVzUwWlhKd2IyeGhkR2x2YmkxbWFXeDBaWEp6UFNKelVrZENJaUJtYVd4MFpYSlZibWwwY3owaWRYTmxjbE53WVdObFQyNVZjMlVpSUdobGFXZG9kRDBpTlRBd0lpQjNhV1IwYUQwaU5UQXdJajQ4Wm1WRWNtOXdVMmhoWkc5M0lHUjRQU0l4SWlCa2VUMGlNaUlnYzNSa1JHVjJhV0YwYVc5dVBTSTRJaUJtYkc5dlpDMXZjR0ZqYVhSNVBTSXVOamNpSUhkcFpIUm9QU0l5TURBbElpQm9aV2xuYUhROUlqSXdNQ1VpSUM4K1BDOW1hV3gwWlhJK1BHeHBibVZoY2tkeVlXUnBaVzUwSUdsa1BTSkNJaUI0TVQwaU1DSWdlVEU5SWpBaUlIZ3lQU0l4TlRBd01DSWdlVEk5SWpBaUlHZHlZV1JwWlc1MFZXNXBkSE05SW5WelpYSlRjR0ZqWlU5dVZYTmxJajQ4YzNSdmNDQnZabVp6WlhROUlpNHdOU0lnYzNSdmNDMWpiMnh2Y2owaUkyRmtNREJtWmlJZ0x6NDhjM1J2Y0NCdlptWnpaWFE5SWk0eU15SWdjM1J2Y0MxamIyeHZjajBpSXpSbE1EQmxZeUlnTHo0OGMzUnZjQ0J2Wm1aelpYUTlJaTQwTVNJZ2MzUnZjQzFqYjJ4dmNqMGlJMlptTURCbU5TSWdMejQ4YzNSdmNDQnZabVp6WlhROUlpNDFPU0lnYzNSdmNDMWpiMnh2Y2owaUkyVXdaVEJsTUNJZ0x6NDhjM1J2Y0NCdlptWnpaWFE5SWk0M055SWdjM1J2Y0MxamIyeHZjajBpSTJabVpEZ3hNQ0lnTHo0OGMzUnZjQ0J2Wm1aelpYUTlJaTQ1TlNJZ2MzUnZjQzFqYjJ4dmNqMGlJMkZrTURCbVppSWdMejQ4TDJ4cGJtVmhja2R5WVdScFpXNTBQanhzYVc1bFlYSkhjbUZrYVdWdWRDQnBaRDBpUXlJZ2VERTlJakFpSUhreFBTSTJNQ0lnZURJOUlqQWlJSGt5UFNJeE1UQWlJR2R5WVdScFpXNTBWVzVwZEhNOUluVnpaWEpUY0dGalpVOXVWWE5sSWo0OGMzUnZjQ0J6ZEc5d0xXTnZiRzl5UFNJalpEQTBNR0k0SWlBdlBqeHpkRzl3SUc5bVpuTmxkRDBpTVNJZ2MzUnZjQzFqYjJ4dmNqMGlJMlV3WlRCbE1DSWdMejQ4TDJ4cGJtVmhja2R5WVdScFpXNTBQand2WkdWbWN6NDhjR0YwYUNCbWFXeHNQU0oxY213b0kwSXBJaUJrUFNKTk1DQXdhREUxTURBd2RqVXdNRWd3ZWlJK1BHRnVhVzFoZEdWVWNtRnVjMlp2Y20wZ1lYUjBjbWxpZFhSbFRtRnRaVDBpZEhKaGJuTm1iM0p0SWlCaGRIUnlhV0oxZEdWVWVYQmxQU0pZVFV3aUlIUjVjR1U5SW5SeVlXNXpiR0YwWlNJZ1puSnZiVDBpTUNBd0lpQjBiejBpTFRFME5UQXdJREFpSUdSMWNqMGlNVFp6SWlCeVpYQmxZWFJEYjNWdWREMGlhVzVrWldacGJtbDBaU0lnTHo0OEwzQmhkR2crUEdOcGNtTnNaU0JtYVd4c1BTSWpNV1F4WlRJd0lpQmplRDBpTVRBd0lpQmplVDBpT1RBaUlISTlJalExSWlCbWFXeDBaWEk5SW5WeWJDZ2pRU2tpSUM4K1BIUmxlSFFnZUQwaU1UQXhJaUI1UFNJNU9TSWdkR1Y0ZEMxaGJtTm9iM0k5SW0xcFpHUnNaU0lnWTJ4aGMzTTlJbTVtZEV4dloyOGlJR1p2Ym5RdGMybDZaVDBpTXpKd2VDSWdabWxzYkQwaWRYSnNLQ05ES1NJZ1ptbHNkR1Z5UFNKMWNtd29JMEVwSWo1RVgwUThZVzVwYldGMFpWUnlZVzV6Wm05eWJTQmhkSFJ5YVdKMWRHVk9ZVzFsUFNKMGNtRnVjMlp2Y20waUlHRjBkSEpwWW5WMFpWUjVjR1U5SWxoTlRDSWdkSGx3WlQwaWNtOTBZWFJsSWlCbWNtOXRQU0l3SURFd01DQTVNQ0lnZEc4OUlqTTJNQ0F4TURBZ09UQWlJR1IxY2owaU5YTWlJSEpsY0dWaGRFTnZkVzUwUFNKcGJtUmxabWx1YVhSbElpQXZQand2ZEdWNGRENDhaeUJtYjI1MExYTnBlbVU5SWpNeUlpQm1hV3hzUFNJalptWm1JaUJtYVd4MFpYSTlJblZ5YkNnalFTa2lQangwWlhoMElIZzlJakkxTUNJZ2VUMGlNamd3SWlCMFpYaDBMV0Z1WTJodmNqMGliV2xrWkd4bElpQmpiR0Z6Y3owaWRHbGxjazVoYldVaVBrSmhjMmxqUEM5MFpYaDBQand2Wno0OEwzTjJaejQ9IiwiYXR0cmlidXRlcyI6W3sidHJhaXRfdHlwZSI6ICJUaWVyIiwgInZhbHVlIjogIkJhc2ljIiB9XX0=',
        )
      })

}); 