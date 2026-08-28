// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MIAAsset} from "../src/MIAAsset.sol";

contract DeployMIAAsset is Script {
    function run() external {
        vm.startBroadcast();
        MIAAsset asset = new MIAAsset();
        vm.stopBroadcast();

        console.log("MIAAsset deployed at:", address(asset));
    }
}
