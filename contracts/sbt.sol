// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract SBT is ERC721, Ownable {
    string public baseURI;
    uint256 public mintPrice;
    uint256 private _currentTokenId = 0;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 mintPrice_
    ) ERC721(name_, symbol_) {
        setBaseURI(baseURI_);
        setMintPrice(mintPrice_);
    }

    function mint() external payable {
        require(balanceOf(msg.sender) == 0, 'Only one token is allowed');
        require(msg.value >= mintPrice, 'Insufficient payment for minting');

        __mint(msg.sender);
    }

    function mintByOwner(address to) external onlyOwner {
        require(balanceOf(to) == 0, 'Only one token is allowed');
        __mint(to);
    }

    function __mint(address to) private {
        uint256 newTokenId = _getNextTokenId();
        _safeMint(to, newTokenId);
        _incrementTokenId();
    }

    function burn(uint256 tokenId) external {
        require(
            msg.sender == owner() || msg.sender == ownerOf(tokenId),
            'Only contract owner or token owner can burn the token'
        );
        _burn(tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override onlyOwner {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override onlyOwner {
        super.safeTransferFrom(from, to, tokenId);
    }

    function withdraw() public onlyOwner {
        address payable owner = payable(owner());
        owner.transfer(address(this).balance);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return string(abi.encodePacked(super.tokenURI(tokenId), '.json'));
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setMintPrice(uint256 mintPrice_) public onlyOwner {
        mintPrice = mintPrice_;
    }

    function _getNextTokenId() private view returns (uint256) {
        return _currentTokenId + 1;
    }

    function _incrementTokenId() private {
        _currentTokenId++;
    }
}
