// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MIAUSDC} from "../src/MIAUSDC.sol";
import {MIAUSDT} from "../src/MIAUSDT.sol";
import {MIAWBTC} from "../src/MIAWBTC.sol";

contract DeployMIATokens is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        MIAUSDC usdc = new MIAUSDC();
        MIAUSDT usdt = new MIAUSDT();
        MIAWBTC wbtc = new MIAWBTC();

        vm.stopBroadcast();

        console.log("MIAUSDC deployed at:", address(usdc));
        console.log("MIAUSDT deployed at:", address(usdt));
        console.log("MIAWBTC deployed at:", address(wbtc));
    }
}
