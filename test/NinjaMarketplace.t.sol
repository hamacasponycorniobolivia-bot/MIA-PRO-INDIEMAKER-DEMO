// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {NinjaAsset} from "../src/NinjaAsset.sol";
import {NinjaUSDC} from "../src/NinjaUSDC.sol";
import {NinjaMarketplace} from "../src/NinjaMarketplace.sol";

contract NinjaMarketplaceTest is Test {
    NinjaAsset public asset;
    NinjaUSDC public usdc;
    NinjaMarketplace public marketplace;

    address public seller = makeAddr("seller");
    address public buyer = makeAddr("buyer");
    address public attacker = makeAddr("attacker");

    uint256 public constant PRICE = 100 ether;

    function setUp() public {
        asset = new NinjaAsset();
        usdc = new NinjaUSDC();
        marketplace = new NinjaMarketplace(address(usdc));

        // Give buyer test NUSDC.
        usdc.transfer(buyer, PRICE);

        // Mint NFT #0 to seller.
        asset.mint(seller, "ipfs://ninja/0.json");
    }

    function _approveMarketplace() internal {
        vm.prank(seller);
        asset.approve(address(marketplace), 0);
    }

    function _createListing() internal {
        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(
            address(asset),
            0,
            PRICE
        );
    }

    function _approveUSDC() internal {
        vm.prank(buyer);
        usdc.approve(address(marketplace), PRICE);
    }

    // =============================================================
    // DEPLOYMENT
    // =============================================================

    function testDeployment() public {
        assertEq(address(marketplace.usdc()), address(usdc));
        assertEq(asset.owner(), address(this));
        assertEq(usdc.owner(), address(this));
        assertEq(marketplace.owner(), address(this));
    }

    // =============================================================
    // NFT
    // =============================================================

    function testMintCreatesNFT() public {
        assertEq(asset.ownerOf(0), seller);
        assertEq(asset.balanceOf(seller), 1);
        assertEq(asset.tokenURI(0), "ipfs://ninja/0.json");
    }

    // =============================================================
    // LISTING
    // =============================================================

    function testSellerCanListNFT() public {
        _createListing();

        (
            address listingSeller,
            address nftContract,
            uint256 tokenId,
            uint256 price,
            bool active
        ) = marketplace.listings(0);

        assertEq(listingSeller, seller);
        assertEq(nftContract, address(asset));
        assertEq(tokenId, 0);
        assertEq(price, PRICE);
        assertTrue(active);
    }

    function testCannotListWithoutOwnership() public {
        _approveMarketplace();

        vm.prank(attacker);

        vm.expectRevert(NinjaMarketplace.NotOwner.selector);
        marketplace.list(
            address(asset),
            0,
            PRICE
        );
    }

    function testCannotListWithoutApproval() public {
        vm.prank(seller);

        vm.expectRevert(NinjaMarketplace.MarketplaceNotApproved.selector);
        marketplace.list(
            address(asset),
            0,
            PRICE
        );
    }

    function testCannotListWithZeroPrice() public {
        _approveMarketplace();

        vm.prank(seller);

        vm.expectRevert(NinjaMarketplace.InvalidPrice.selector);
        marketplace.list(
            address(asset),
            0,
            0
        );
    }

    // =============================================================
    // CANCEL
    // =============================================================

    function testSellerCanCancelListing() public {
        _createListing();

        vm.prank(seller);
        marketplace.cancel(0);

        (
            ,
            ,
            ,
            ,
            bool active
        ) = marketplace.listings(0);

        assertFalse(active);
    }

    function testAttackerCannotCancelListing() public {
        _createListing();

        vm.prank(attacker);

        vm.expectRevert(NinjaMarketplace.NotSeller.selector);
        marketplace.cancel(0);
    }

    function testCannotCancelListingTwice() public {
        _createListing();

        vm.prank(seller);
        marketplace.cancel(0);

        vm.prank(seller);

        vm.expectRevert(NinjaMarketplace.ListingNotActive.selector);
        marketplace.cancel(0);
    }

    // =============================================================
    // BUY
    // =============================================================

    function testBuyerCanBuyNFT() public {
        _createListing();
        _approveUSDC();

        vm.prank(buyer);
        marketplace.buy(0);

        assertEq(asset.ownerOf(0), buyer);
        assertEq(asset.balanceOf(buyer), 1);

        assertEq(usdc.balanceOf(buyer), 0);
        assertEq(usdc.balanceOf(seller), PRICE);

        (
            ,
            ,
            ,
            ,
            bool active
        ) = marketplace.listings(0);

        assertFalse(active);
    }

    function testSellerCannotBuyOwnNFT() public {
        _createListing();

        vm.prank(seller);

        vm.expectRevert(NinjaMarketplace.CannotBuyOwnNFT.selector);
        marketplace.buy(0);
    }

    function testCannotBuyInactiveListing() public {
        _createListing();

        vm.prank(seller);
        marketplace.cancel(0);

        vm.prank(buyer);

        vm.expectRevert(NinjaMarketplace.ListingNotActive.selector);
        marketplace.buy(0);
    }

    function testCannotBuyWithoutAllowance() public {
        _createListing();

        vm.prank(buyer);

        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC20InsufficientAllowance(address,uint256,uint256)",
                address(marketplace),
                0,
                PRICE
            )
        );
        marketplace.buy(0);
    }

    function testCannotBuyWithoutEnoughUSDC() public {
        _createListing();

        vm.prank(buyer);
        usdc.approve(address(marketplace), PRICE);

        vm.prank(buyer);
        usdc.transfer(attacker, PRICE);

        vm.prank(buyer);

        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC20InsufficientBalance(address,uint256,uint256)",
                buyer,
                0,
                PRICE
            )
        );
        marketplace.buy(0);
    }

    // =============================================================
    // EDGE CASES
    // =============================================================

    function testListingBecomesStaleIfSellerTransfersNFT() public {
        _createListing();

        address thirdParty = makeAddr("thirdParty");

        vm.prank(seller);
        asset.transferFrom(seller, thirdParty, 0);

        assertEq(asset.ownerOf(0), thirdParty);

        _approveUSDC();

        vm.prank(buyer);

        vm.expectRevert();
        marketplace.buy(0);
    }

    function testListingBecomesStaleIfApprovalIsRevoked() public {
        _createListing();

        vm.prank(seller);
        asset.approve(address(0), 0);

        _approveUSDC();

        vm.prank(buyer);

        vm.expectRevert();
        marketplace.buy(0);
    }

    function testMultipleListings() public {
        // Mint second NFT.
        asset.mint(seller, "ipfs://ninja/1.json");

        vm.startPrank(seller);

        asset.approve(address(marketplace), 0);
        marketplace.list(address(asset), 0, PRICE);

        asset.approve(address(marketplace), 1);
        marketplace.list(address(asset), 1, PRICE * 2);

        vm.stopPrank();

        (
            address seller0,
            ,
            uint256 token0,
            uint256 price0,
            bool active0
        ) = marketplace.listings(0);

        (
            address seller1,
            ,
            uint256 token1,
            uint256 price1,
            bool active1
        ) = marketplace.listings(1);

        assertEq(seller0, seller);
        assertEq(token0, 0);
        assertEq(price0, PRICE);
        assertTrue(active0);

        assertEq(seller1, seller);
        assertEq(token1, 1);
        assertEq(price1, PRICE * 2);
        assertTrue(active1);
    }

    function testCannotBuyNonexistentListing() public {
        vm.prank(buyer);

        vm.expectRevert(NinjaMarketplace.ListingNotActive.selector);
        marketplace.buy(999);
    }
}
