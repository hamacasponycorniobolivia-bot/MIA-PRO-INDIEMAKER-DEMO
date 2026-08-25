// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {NinjaAsset} from "../src/NinjaAsset.sol";

contract DeployNinjaAsset is Script {
    function run() external {
        vm.startBroadcast();
        NinjaAsset asset = new NinjaAsset();
        vm.stopBroadcast();

        console.log("NinjaAsset deployed at:", address(asset));
    }
}
