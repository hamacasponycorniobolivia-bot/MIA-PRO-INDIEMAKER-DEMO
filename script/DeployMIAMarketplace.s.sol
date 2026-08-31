// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MIAMarketplace} from "../src/MIAMarketplace.sol";

contract DeployMIAMarketplace is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        MIAMarketplace marketplace = new MIAMarketplace(
            vm.envAddress("USDC_ADDRESS"),
            vm.envAddress("USDT_ADDRESS"),
            vm.envAddress("WBTC_ADDRESS")
        );

        vm.stopBroadcast();

        console.log("MIAMarketplace deployed at:", address(marketplace));
    }
}
