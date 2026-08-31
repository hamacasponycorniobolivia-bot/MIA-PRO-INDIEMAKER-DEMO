// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MIAAsset} from "../src/MIAAsset.sol";
import {MIAUSDC} from "../src/MIAUSDC.sol";
import {MIAUSDT} from "../src/MIAUSDT.sol";
import {MIAWBTC} from "../src/MIAWBTC.sol";
import {MIAMarketplace} from "../src/MIAMarketplace.sol";

contract MIAMarketplaceTest is Test {
    MIAAsset public asset;
    MIAUSDC public usdc;
    MIAUSDT public usdt;
    MIAWBTC public wbtc;
    MIAMarketplace public marketplace;

    address public seller = makeAddr("seller");
    address public buyer = makeAddr("buyer");
    address public attacker = makeAddr("attacker");

    uint256 public constant PRICE = 100 ether;
    uint256 public constant WBTC_PRICE = 100 * 10 ** 8;

    function setUp() public {
        asset = new MIAAsset();
        usdc = new MIAUSDC();
        usdt = new MIAUSDT();
        wbtc = new MIAWBTC();
        marketplace = new MIAMarketplace(address(usdc), address(usdt), address(wbtc));

        // Give buyer test MUSD.
        require(usdc.transfer(buyer, PRICE));

        // Mint NFT #0 to seller.
        asset.mint(seller, "ipfs://MIA/0.json");
    }

    function _approveMarketplace() internal {
        vm.prank(seller);
        asset.approve(address(marketplace), 0);
    }

    function _createListing() internal {
        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, PRICE, address(usdc));
    }

    function _approveUSDC() internal {
        vm.prank(buyer);
        usdc.approve(address(marketplace), PRICE);
    }

    // =============================================================
    // DEPLOYMENT
    // =============================================================

    function testDeployment() public view {
        assertEq(address(marketplace.usdc()), address(usdc));
        assertEq(asset.owner(), address(this));
        assertEq(usdc.owner(), address(this));
        assertEq(marketplace.owner(), address(this));
    }

    // =============================================================
    // NFT
    // =============================================================

    function testMintCreatesNFT() public view {
        assertEq(asset.ownerOf(0), seller);
        assertEq(asset.balanceOf(seller), 1);
        assertEq(asset.tokenURI(0), "ipfs://MIA/0.json");
    }

    // =============================================================
    // LISTING
    // =============================================================

    function testSellerCanListNFT() public {
        _createListing();

        (address listingSeller, address nftContract, uint256 tokenId, uint256 price, bool active,) =
            marketplace.listings(0);

        assertEq(listingSeller, seller);
        assertEq(nftContract, address(asset));
        assertEq(tokenId, 0);
        assertEq(price, PRICE);
        assertTrue(active);
    }

    function testCannotListWithoutOwnership() public {
        _approveMarketplace();

        vm.prank(attacker);

        vm.expectRevert(MIAMarketplace.NotOwner.selector);
        marketplace.list(address(asset), 0, PRICE, address(usdc));
    }

    function testCannotListWithoutApproval() public {
        vm.prank(seller);

        vm.expectRevert(MIAMarketplace.MarketplaceNotApproved.selector);
        marketplace.list(address(asset), 0, PRICE, address(usdc));
    }

    function testCannotListWithZeroPrice() public {
        _approveMarketplace();

        vm.prank(seller);

        vm.expectRevert(MIAMarketplace.InvalidPrice.selector);
        marketplace.list(address(asset), 0, 0, address(usdc));
    }

    // =============================================================
    // CANCEL
    // =============================================================

    function testSellerCanCancelListing() public {
        _createListing();

        vm.prank(seller);
        marketplace.cancel(0);

        (,,,, bool active,) = marketplace.listings(0);

        assertFalse(active);
    }

    function testAttackerCannotCancelListing() public {
        _createListing();

        vm.prank(attacker);

        vm.expectRevert(MIAMarketplace.NotSeller.selector);
        marketplace.cancel(0);
    }

    function testCannotCancelListingTwice() public {
        _createListing();

        vm.prank(seller);
        marketplace.cancel(0);

        vm.prank(seller);

        vm.expectRevert(MIAMarketplace.ListingNotActive.selector);
        marketplace.cancel(0);
    }

    // =============================================================
    // BUY
    // =============================================================

    function testCannotSendETHForUSDCListing() public {
        _createListing();

        vm.deal(buyer, PRICE);

        vm.prank(buyer);
        vm.expectRevert(MIAMarketplace.PaymentFailed.selector);
        marketplace.buy{value: PRICE}(0);
    }

    function testUSDCPaymentRevertsAtomicallyIfNFTTransferFails() public {
        _createListing();

        _approveUSDC();

        vm.prank(seller);
        asset.approve(address(0), 0);

        uint256 buyerBalanceBefore = usdc.balanceOf(buyer);
        uint256 sellerBalanceBefore = usdc.balanceOf(seller);

        vm.prank(buyer);
        vm.expectRevert(MIAMarketplace.NFTNotAvailable.selector);
        marketplace.buy(0);

        assertEq(usdc.balanceOf(buyer), buyerBalanceBefore);
        assertEq(usdc.balanceOf(seller), sellerBalanceBefore);

        (,,,, bool active,) = marketplace.listings(0);
        assertTrue(active);
        assertEq(asset.ownerOf(0), seller);
    }

    function testBuyerCanBuyNFT() public {
        _createListing();
        _approveUSDC();

        vm.prank(buyer);
        marketplace.buy(0);

        assertEq(asset.ownerOf(0), buyer);
        assertEq(asset.balanceOf(buyer), 1);

        assertEq(usdc.balanceOf(buyer), 0);
        assertEq(usdc.balanceOf(seller), PRICE);

        (,,,, bool active,) = marketplace.listings(0);

        assertFalse(active);
    }

    function testCannotBuyNFTWithWrongETHAmount() public {
        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, PRICE, address(0));

        vm.deal(buyer, PRICE - 1);

        vm.prank(buyer);
        vm.expectRevert(MIAMarketplace.PaymentFailed.selector);
        marketplace.buy{value: PRICE - 1}(0);
    }

    function testCannotBuyETHListingWithoutPayment() public {
        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, PRICE, address(0));

        vm.prank(buyer);
        vm.expectRevert(MIAMarketplace.PaymentFailed.selector);
        marketplace.buy(0);
    }

    function testBuyerCanBuyNFTWithETH() public {
        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, PRICE, address(0));

        vm.deal(buyer, PRICE);

        uint256 sellerBalanceBefore = seller.balance;

        vm.prank(buyer);
        marketplace.buy{value: PRICE}(0);

        assertEq(asset.ownerOf(0), buyer);
        assertEq(asset.balanceOf(buyer), 1);
        assertEq(seller.balance, sellerBalanceBefore + PRICE);

        (,,,, bool active,) = marketplace.listings(0);
        assertFalse(active);
    }

    function testCannotListWithInvalidPaymentToken() public {
        _approveMarketplace();

        address fakeToken = makeAddr("fakeToken");

        vm.prank(seller);
        vm.expectRevert(MIAMarketplace.InvalidPaymentToken.selector);
        marketplace.list(address(asset), 0, PRICE, fakeToken);
    }

    function testCannotSendETHForUSDTListing() public {
        require(usdt.transfer(buyer, PRICE));

        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, PRICE, address(usdt));

        vm.prank(buyer);
        usdt.approve(address(marketplace), PRICE);

        vm.deal(buyer, PRICE);

        vm.prank(buyer);
        vm.expectRevert(MIAMarketplace.PaymentFailed.selector);
        marketplace.buy{value: PRICE}(0);
    }

    function testETHListingStoresPaymentToken() public {
        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, PRICE, address(0));

        (,,,, bool active, address paymentToken) = marketplace.listings(0);

        assertTrue(active);
        assertEq(paymentToken, address(0));
    }

    function testListingStoresPaymentToken() public {
        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, PRICE, address(usdt));

        (,,,, bool active, address paymentToken) = marketplace.listings(0);

        assertTrue(active);
        assertEq(paymentToken, address(usdt));
    }

    function testUSDTPaymentRevertsAtomicallyIfNFTTransferFails() public {
        require(usdt.transfer(buyer, PRICE));

        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, PRICE, address(usdt));

        vm.prank(buyer);
        usdt.approve(address(marketplace), PRICE);

        vm.prank(seller);
        asset.approve(address(0), 0);

        uint256 buyerBalanceBefore = usdt.balanceOf(buyer);
        uint256 sellerBalanceBefore = usdt.balanceOf(seller);

        vm.prank(buyer);
        vm.expectRevert(MIAMarketplace.NFTNotAvailable.selector);
        marketplace.buy(0);

        assertEq(usdt.balanceOf(buyer), buyerBalanceBefore);
        assertEq(usdt.balanceOf(seller), sellerBalanceBefore);

        (,,,, bool active,) = marketplace.listings(0);
        assertTrue(active);
        assertEq(asset.ownerOf(0), seller);
    }

    function testWBTCPaymentRevertsAtomicallyIfNFTTransferFails() public {
        require(wbtc.transfer(buyer, WBTC_PRICE));

        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, WBTC_PRICE, address(wbtc));

        vm.prank(buyer);
        wbtc.approve(address(marketplace), WBTC_PRICE);

        vm.prank(seller);
        asset.approve(address(0), 0);

        uint256 buyerBalanceBefore = wbtc.balanceOf(buyer);
        uint256 sellerBalanceBefore = wbtc.balanceOf(seller);

        vm.prank(buyer);
        vm.expectRevert(MIAMarketplace.NFTNotAvailable.selector);
        marketplace.buy(0);

        assertEq(wbtc.balanceOf(buyer), buyerBalanceBefore);
        assertEq(wbtc.balanceOf(seller), sellerBalanceBefore);

        (,,,, bool active,) = marketplace.listings(0);
        assertTrue(active);
        assertEq(asset.ownerOf(0), seller);
    }

    function testCannotBuyWBTCWithoutAllowance() public {
        require(wbtc.transfer(buyer, WBTC_PRICE));

        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, WBTC_PRICE, address(wbtc));

        uint256 buyerBalanceBefore = wbtc.balanceOf(buyer);
        uint256 sellerBalanceBefore = wbtc.balanceOf(seller);

        vm.prank(buyer);
        vm.expectRevert();
        marketplace.buy(0);

        assertEq(wbtc.balanceOf(buyer), buyerBalanceBefore);
        assertEq(wbtc.balanceOf(seller), sellerBalanceBefore);

        (,,,, bool active,) = marketplace.listings(0);
        assertTrue(active);
        assertEq(asset.ownerOf(0), seller);
    }

    function testCannotBuyWBTCWithoutEnoughBalance() public {
        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, WBTC_PRICE, address(wbtc));

        vm.prank(buyer);
        wbtc.approve(address(marketplace), WBTC_PRICE);

        uint256 buyerBalanceBefore = wbtc.balanceOf(buyer);
        uint256 sellerBalanceBefore = wbtc.balanceOf(seller);

        vm.prank(buyer);
        vm.expectRevert();
        marketplace.buy(0);

        assertEq(wbtc.balanceOf(buyer), buyerBalanceBefore);
        assertEq(wbtc.balanceOf(seller), sellerBalanceBefore);

        (,,,, bool active,) = marketplace.listings(0);
        assertTrue(active);
        assertEq(asset.ownerOf(0), seller);
    }

    function testBuyerCanBuyNFTWithWBTC() public {
        require(wbtc.transfer(buyer, WBTC_PRICE));

        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, WBTC_PRICE, address(wbtc));

        vm.prank(buyer);
        wbtc.approve(address(marketplace), WBTC_PRICE);

        vm.prank(buyer);
        marketplace.buy(0);

        assertEq(asset.ownerOf(0), buyer);
        assertEq(asset.balanceOf(buyer), 1);

        assertEq(wbtc.balanceOf(buyer), 0);
        assertEq(wbtc.balanceOf(seller), WBTC_PRICE);

        (,,,, bool active,) = marketplace.listings(0);
        assertFalse(active);
    }

    function testBuyerCanBuyNFTWithUSDT() public {
        require(usdt.transfer(buyer, PRICE));

        _approveMarketplace();

        vm.prank(seller);
        marketplace.list(address(asset), 0, PRICE, address(usdt));

        vm.prank(buyer);
        usdt.approve(address(marketplace), PRICE);

        vm.prank(buyer);
        marketplace.buy(0);

        assertEq(asset.ownerOf(0), buyer);
        assertEq(asset.balanceOf(buyer), 1);

        assertEq(usdt.balanceOf(buyer), 0);
        assertEq(usdt.balanceOf(seller), PRICE);

        (,,,, bool active,) = marketplace.listings(0);
        assertFalse(active);
    }

    function testSellerCannotBuyOwnNFT() public {
        _createListing();

        vm.prank(seller);

        vm.expectRevert(MIAMarketplace.CannotBuyOwnNFT.selector);
        marketplace.buy(0);
    }

    function testCannotBuyInactiveListing() public {
        _createListing();

        vm.prank(seller);
        marketplace.cancel(0);

        vm.prank(buyer);

        vm.expectRevert(MIAMarketplace.ListingNotActive.selector);
        marketplace.buy(0);
    }

    function testCannotBuyWithoutAllowance() public {
        _createListing();

        vm.prank(buyer);

        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC20InsufficientAllowance(address,uint256,uint256)", address(marketplace), 0, PRICE
            )
        );
        marketplace.buy(0);
    }

    function testCannotBuyWithoutEnoughUSDC() public {
        _createListing();

        vm.prank(buyer);
        usdc.approve(address(marketplace), PRICE);

        vm.prank(buyer);
        require(usdc.transfer(attacker, PRICE));

        vm.prank(buyer);

        vm.expectRevert(abi.encodeWithSignature("ERC20InsufficientBalance(address,uint256,uint256)", buyer, 0, PRICE));
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
        asset.mint(seller, "ipfs://MIA/1.json");

        vm.startPrank(seller);

        asset.approve(address(marketplace), 0);
        marketplace.list(address(asset), 0, PRICE, address(usdc));

        asset.approve(address(marketplace), 1);
        marketplace.list(address(asset), 1, PRICE * 2, address(usdc));

        vm.stopPrank();

        (address seller0,, uint256 token0, uint256 price0, bool active0,) = marketplace.listings(0);

        (address seller1,, uint256 token1, uint256 price1, bool active1,) = marketplace.listings(1);

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

        vm.expectRevert(MIAMarketplace.ListingNotActive.selector);
        marketplace.buy(999);
    }
}
