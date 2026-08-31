// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MIAMarketplace is Ownable, ReentrancyGuard {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
        address paymentToken;
    }

    address public constant ETH = address(0);

    IERC20 public immutable usdc;
    IERC20 public immutable usdt;
    IERC20 public immutable wbtc;

    uint256 private _listingId;
    mapping(uint256 => Listing) public listings;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken
    );

    event Sold(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price);

    event Cancelled(uint256 indexed listingId);

    error InvalidUSDC();
    error InvalidUSDT();
    error InvalidWBTC();
    error InvalidPaymentToken();
    error InvalidNFTContract();
    error InvalidPrice();
    error NotOwner();
    error MarketplaceNotApproved();
    error ListingNotActive();
    error CannotBuyOwnNFT();
    error NFTNotAvailable();
    error PaymentFailed();
    error NotSeller();

    constructor(address usdcAddress, address usdtAddress, address wbtcAddress) Ownable(msg.sender) {
        if (usdcAddress == address(0)) revert InvalidUSDC();
        if (usdtAddress == address(0)) revert InvalidUSDT();
        if (wbtcAddress == address(0)) revert InvalidWBTC();

        usdc = IERC20(usdcAddress);
        usdt = IERC20(usdtAddress);
        wbtc = IERC20(wbtcAddress);
    }

    function list(address nftContract, uint256 tokenId, uint256 price, address paymentToken) external {
        if (nftContract == address(0)) revert InvalidNFTContract();
        if (price == 0) revert InvalidPrice();

        if (
            paymentToken != ETH &&
            paymentToken != address(usdc) &&
            paymentToken != address(usdt) &&
            paymentToken != address(wbtc)
        ) {
            revert InvalidPaymentToken();
        }

        IERC721 nft = IERC721(nftContract);

        if (nft.ownerOf(tokenId) != msg.sender) {
            revert NotOwner();
        }

        if (nft.getApproved(tokenId) != address(this) && !nft.isApprovedForAll(msg.sender, address(this))) {
            revert MarketplaceNotApproved();
        }

        uint256 id = _listingId++;

        listings[id] =
            Listing({
                seller: msg.sender,
                nftContract: nftContract,
                tokenId: tokenId,
                price: price,
                active: true,
                paymentToken: paymentToken
            });

        emit Listed(id, msg.sender, nftContract, tokenId, price, paymentToken);
    }

    function buy(uint256 listingId) external payable nonReentrant {
        Listing memory listing = listings[listingId];

        if (!listing.active) revert ListingNotActive();
        if (msg.sender == listing.seller) revert CannotBuyOwnNFT();

        IERC721 nft = IERC721(listing.nftContract);

        if (nft.ownerOf(listing.tokenId) != listing.seller) {
            revert NFTNotAvailable();
        }

        if (nft.getApproved(listing.tokenId) != address(this) && !nft.isApprovedForAll(listing.seller, address(this))) {
            revert NFTNotAvailable();
        }

        listings[listingId].active = false;

        if (listing.paymentToken == ETH) {
            if (msg.value != listing.price) revert PaymentFailed();

            (bool sent,) = payable(listing.seller).call{value: msg.value}("");
            if (!sent) revert PaymentFailed();
        } else {
            if (msg.value != 0) revert PaymentFailed();

            IERC20 paymentToken = IERC20(listing.paymentToken);

            if (!paymentToken.transferFrom(msg.sender, listing.seller, listing.price)) {
                revert PaymentFailed();
            }
        }

        nft.transferFrom(listing.seller, msg.sender, listing.tokenId);

        emit Sold(listingId, msg.sender, listing.seller, listing.price);
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
