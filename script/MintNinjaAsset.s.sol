// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {NinjaAsset} from "../src/NinjaAsset.sol";

contract MintNinjaAsset is Script {
    function run() external {
        address asset = 0xF4e85A82fea1f4c4BE98A457221909Ca9f26527E;
        address recipient = vm.addr(vm.envUint("PRIVATE_KEY"));

        vm.startBroadcast();

        NinjaAsset(asset).mint(recipient, "https://example.com/ninja/1.json");

        vm.stopBroadcast();

        console2.log("NinjaAsset mint enviado");
        console2.log("Asset:", asset);
        console2.log("Recipient:", recipient);
    }
}
