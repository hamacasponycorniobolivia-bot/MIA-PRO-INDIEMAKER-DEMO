// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {NinjaMarketplace} from "../src/NinjaMarketplace.sol";

contract DeployNinjaMarketplace is Script {
    function run() external {
        vm.startBroadcast();
        NinjaMarketplace marketplace = new NinjaMarketplace(vm.envAddress("USDC_ADDRESS"));
        vm.stopBroadcast();

        console.log("NinjaMarketplace deployed at:", address(marketplace));
    }
}
