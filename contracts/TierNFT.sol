// SPDX-License-Identifier: MIT

// Layout of Contract:
// version
// imports
// interfaces, libraries, contracts
// errors
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions

pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract TierNFT is ERC721, Ownable {
    //////////////////
    //  Erros       //
    //////////////////
    error TIER__NOT_ENOUGH_VALUE_FOR_MINIMUM();
    error TOKEN__TOKEN_DOES_NOT_EXIST();
    error BALANCE__WITHDRAWAL_FAILED();
    error BALANCE__ZERO_BALANCE();

    ////////////////////////////
    //  State Variables       //
    ////////////////////////////
    string constant SVG_START = '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" fill="none" font-family="sans-serif"><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="500" width="500"><feDropShadow dx="1" dy="2" stdDeviation="8" flood-opacity=".67" width="200%" height="200%" /></filter><linearGradient id="B" x1="0" y1="0" x2="15000" y2="0" gradientUnits="userSpaceOnUse"><stop offset=".05" stop-color="#ad00ff" /><stop offset=".23" stop-color="#4e00ec" /><stop offset=".41" stop-color="#ff00f5" /><stop offset=".59" stop-color="#e0e0e0" /><stop offset=".77" stop-color="#ffd810" /><stop offset=".95" stop-color="#ad00ff" /></linearGradient><linearGradient id="C" x1="0" y1="60" x2="0" y2="110" gradientUnits="userSpaceOnUse"><stop stop-color="#d040b8" /><stop offset="1" stop-color="#e0e0e0" /></linearGradient></defs><path fill="url(#B)" d="M0 0h15000v500H0z"><animateTransform attributeName="transform" attributeType="XML" type="translate" from="0 0" to="-14500 0" dur="16s" repeatCount="indefinite" /></path><circle fill="#1d1e20" cx="100" cy="90" r="45" filter="url(#A)" /><text x="101" y="99" text-anchor="middle" class="nftLogo" font-size="32px" fill="url(#C)" filter="url(#A)">D_D<animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 100 90" to="360 100 90" dur="5s" repeatCount="indefinite" /></text><g font-size="32" fill="#fff" filter="url(#A)"><text x="250" y="280" text-anchor="middle" class="tierName">';
    string constant SVG_END = "</text></g></svg>";
    string constant TIER_NAME_0 = "Basic";
    string constant TIER_NAME_1 = "Medium";
    string constant TIER_NAME_2 = "Premium";

    uint256 constant TIER_VALUE_0 = 0.01 ether;
    uint256 constant TIER_VALUE_1 = 0.02 ether;
    uint256 constant TIER_VALUE_2 = 0.05 ether;


    uint256 public totalSupply;

    mapping(uint256 => uint256) public tokenTier;

    //////////////////
    //  Events      //
    //////////////////
    event SuccessfulWithdraw(address indexed owner, uint256 amount);


    //////////////////
    //  Functions   //
    //////////////////

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    /////////////////////////////////////////
    //  Public & External View Functions   //
    /////////////////////////////////////////

    function mint() public payable {
        if(msg.value < TIER_VALUE_0) {
            revert TIER__NOT_ENOUGH_VALUE_FOR_MINIMUM();
        }

        
        uint256 tierId = 0;
        if (msg.value >= TIER_VALUE_2) {
            tierId = 2;
        } else if (msg.value >= TIER_VALUE_1) {
            tierId = 1;
        }

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
        tokenTier[totalSupply] = tierId;
    }

    function tierNameOf(uint256 _tokenTier)
        public
        pure
        returns (string memory)
    {
        if(_tokenTier == 0) return TIER_NAME_0;
        if(_tokenTier == 1) return TIER_NAME_1; 
        return TIER_NAME_2;
    }

    function imageSVGOf(uint256 _tokenTier)
        public
        pure
        returns (string memory)
    {
        string(
            abi.encodePacked(SVG_START, tierNameOf(_tokenTier), SVG_END)
        );
    }

    function finalJSON(
        string memory _name,
        uint256 _tokenId,
        string memory _imageSVG,
        uint256 _tokenTier
    ) public pure returns (string memory) {
        return 
            string(
                abi.encodePacked(
                    '{"name": "',
                    _name,
                    " #",
                    Strings.toString(_tokenId),
                    '", "description": "NFT Tier List", "image": "data:image/svg+xml;base64,',
                    _imageSVG,
                    '","attritbutes":[{"trait_type": "Tier", "value": "',
                    tierNameOf(_tokenTier),
                    '"}]}'
                )
            );
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert TOKEN__TOKEN_DOES_NOT_EXIST();
        }

        // string memory tierName = tokenTier[tokenId] == 2
        //     ? TIER_NAME_2
        //     : tokenTier[tokenId] == 1
        //     ? TIER_NAME_1
        //     : TIER_NAME_0;
            
        string memory imageSVG = imageSVGOf(tokenTier[tokenId]);

        string memory json = Base64.encode(
            bytes(
                finalJSON(
                    name(),
                    tokenId,
                    Base64.encode(bytes(imageSVG)),
                    tokenTier[tokenId]
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));  
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) {
            revert BALANCE__ZERO_BALANCE();
        }

        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert BALANCE__WITHDRAWAL_FAILED();
        }

        emit SuccessfulWithdraw(owner(), balance);
    }
}