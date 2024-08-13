// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC1155Base.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract RealEstateNFT is ERC1155Base {
    using Strings for uint256;

    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public tokenPrice;
    
    IERC20 USDC;

    constructor(
        address usdc_address,
        uint128 _royaltyBps,
        string memory _baseURI
    ) ERC1155Base( msg.sender,
        "Real Estate NFT",
        "REN",
        msg.sender,
        _royaltyBps) {
        maxSupply[0] = 20;
        maxSupply[1] = 100;
        maxSupply[2] = 1000;
        maxSupply[3] = 5000;
        tokenPrice[0] = 50000*10**18;
        tokenPrice[1] = 10000*10**18;
        tokenPrice[2] = 1000*10**18;
        tokenPrice[3] = 100*10**18;
        USDC = IERC20(usdc_address);
        _batchMintMetadata(0, 4, _baseURI);
        nextTokenIdToMint_ = 4;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override  {

        if (from == address(0)) {
            for (uint256 i = 0; i < ids.length; ++i) {
                require(maxSupply[ids[i]] >= totalSupply[ids[i]] + amounts[i], "exceeded the limits");
            }
        }
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
    
    function batchMintTo(
        address _to,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        string memory _baseURI
    ) public virtual override {
        require(_amounts.length > 0, "Minting zero tokens.");
        require(_tokenIds.length == _amounts.length, "Length mismatch.");

        uint256 nextIdToMint = nextTokenIdToMint();
        uint256 value;

        for (uint256 i = 0; i < _tokenIds.length; i += 1) {
            require(_tokenIds[i] < nextIdToMint, "invalid id");
            value += tokenPrice[_tokenIds[i]] * _amounts[i];
        }

        require(USDC.transferFrom(msg.sender, address(this), value), "Failed to mint with this USDC balance");
        _mintBatch(_to, _tokenIds, _amounts, "");
    }

    function mintTo(address _to, uint256 _tokenId, string memory _tokenURI, uint256 _amount) public virtual override {
        uint256 tokenIdToMint;
        uint256 nextIdToMint = nextTokenIdToMint();

        require(_tokenId < nextIdToMint, "invalid id");
        tokenIdToMint = _tokenId;

        require(USDC.transferFrom(msg.sender, address(this), tokenPrice[_tokenId]), "Failed to mint with this USDC balance");
        
        _mint(_to, tokenIdToMint, _amount, "");
    }

    function getUSDCbalance() public view returns(uint256) {
        return USDC.balanceOf(address(this));
    }

    function withdrawUSDC(address to, uint256 amount) public {
        require(_canMint(), "Not authorized to withdraw.");
        USDC.transfer(to, amount);
    }
}