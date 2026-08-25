// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NinjaMarketplace is Ownable, ReentrancyGuard {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    IERC20 public immutable usdc;

    uint256 private _listingId;
    mapping(uint256 => Listing) public listings;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 price
    );

    event Sold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    event Cancelled(uint256 indexed listingId);

    error InvalidUSDC();
    error InvalidNFTContract();
    error InvalidPrice();
    error NotOwner();
    error MarketplaceNotApproved();
    error ListingNotActive();
    error CannotBuyOwnNFT();
    error NFTNotAvailable();
    error PaymentFailed();
    error NotSeller();

    constructor(address usdcAddress) Ownable(msg.sender) {
        if (usdcAddress == address(0)) revert InvalidUSDC();
        usdc = IERC20(usdcAddress);
    }

    function list(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {
        if (nftContract == address(0)) revert InvalidNFTContract();
        if (price == 0) revert InvalidPrice();

        IERC721 nft = IERC721(nftContract);

        if (nft.ownerOf(tokenId) != msg.sender) {
            revert NotOwner();
        }

        if (
            nft.getApproved(tokenId) != address(this) &&
            !nft.isApprovedForAll(msg.sender, address(this))
        ) {
            revert MarketplaceNotApproved();
        }

        uint256 id = _listingId++;

        listings[id] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit Listed(
            id,
            msg.sender,
            nftContract,
            tokenId,
            price
        );
    }

    function buy(uint256 listingId) external nonReentrant {
        Listing memory listing = listings[listingId];

        if (!listing.active) revert ListingNotActive();
        if (msg.sender == listing.seller) revert CannotBuyOwnNFT();

        IERC721 nft = IERC721(listing.nftContract);

        if (nft.ownerOf(listing.tokenId) != listing.seller) {
            revert NFTNotAvailable();
        }

        if (
            nft.getApproved(listing.tokenId) != address(this) &&
            !nft.isApprovedForAll(listing.seller, address(this))
        ) {
            revert NFTNotAvailable();
        }

        listings[listingId].active = false;

        if (
            !usdc.transferFrom(
                msg.sender,
                listing.seller,
                listing.price
            )
        ) {
            revert PaymentFailed();
        }

        nft.transferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        emit Sold(
            listingId,
            msg.sender,
            listing.seller,
            listing.price
        );
    }

    function cancel(uint256 listingId) external {
        Listing memory listing = listings[listingId];

        if (listing.seller != msg.sender) {
            revert NotSeller();
        }

        if (!listing.active) revert ListingNotActive();

        listings[listingId].active = false;

        emit Cancelled(listingId);
    }

    function listingCount() external view returns (uint256) {
        return _listingId;
    }
}
