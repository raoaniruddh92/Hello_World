import { abi } from "./Abi";
import { bytecode } from "./bytecode";
import { BrowserProvider, ContractFactory } from "ethers";
const fetch = require('node-fetch');

// --- Configuration ---
const ETHERSCAN_API_KEY = "8K8YXVG18MY3DVVW1DMWTT8FPB5Q55KP9I";
const COMPILER_VERSION = "v0.8.31";
// 1. V2 Unified Base Path - MUST BE CLEAN
const ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api?chainid=11155111"; 
const CONTRACT_SOURCE_CODE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract hello{
    function hello_world() public pure returns (string memory) {
        return "Hello World";
    }
}
`;

// ------------------------------------------------------------------
// 1. Verification Function (V2 Implementation)
// ------------------------------------------------------------------
async function verify_contract(contractAddress, encodedConstructorArgs) {
    console.log("Attempting to verify contract on Etherscan using V2 API...");

    // Source Code is wrapped in the Etherscan-required Standard JSON format
    const sourceCodeJSON = JSON.stringify({
        language: "Solidity",
        sources: {
            "hello.sol": {
                content: CONTRACT_SOURCE_CODE
            }
        },
        settings: {
            optimizer: {
                enabled: 0, 
                runs: 200  
            },
            outputSelection: {
                "*": {
                    "*": ["*"]
                }
            }
        }
    });
    
    // Define all parameters for the POST request body
    const params = {
        apikey: ETHERSCAN_API_KEY,
        // MUST be a parameter in the body (Sepolia: 11155111)
        module: 'contract',
        action: 'verifysinglefile', // Appropriate action for simple contract
        contractaddress: contractAddress,
        sourceCode: sourceCodeJSON, // The complex data goes here
        contractname: 'hello.sol:hello', 
        compilerversion: COMPILER_VERSION,
        constructorArguments: encodedConstructorArgs // Correct parameter name
    };

    // Encode parameters into URLSearchParams for POST body
    const formData = new URLSearchParams();
    for (const key in params) {
        formData.append(key, params[key]);
    }

    try {
        const response = await fetch(ETHERSCAN_API_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = await response.json();
        console.log("Etherscan API Response:", data);

        if (data.status === '1') {
            console.log("✅ Verification request submitted successfully (V2)!");
            console.log("Verification GUID:", data.result);
            console.log(`Monitor status here: https://sepolia.etherscan.io/address/${contractAddress}`);
        } else {
            console.error("❌ Verification Submission Failed:", data.result);
        }
    } catch (error) {
        console.error("Error during Etherscan API call:", error);
    }
}

// ------------------------------------------------------------------
// 2. Deployment Function (Remains the same)
// ------------------------------------------------------------------
export async function deploy_contract() {
    if (!window.ethereum) {
        throw new Error("MetaMask or other Ethereum provider not found.");
    }
    const provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); 
    const signer = await provider.getSigner();  

    const factory = new ContractFactory(abi, bytecode, signer);
    console.log("Attempting to deploy contract...");
    
    const contract = await factory.deploy();
    
    console.log("Deployment transaction sent. Waiting for confirmation...");
    const deploymentReceipt = await contract.waitForDeployment();   
    
    console.log("✅ Contract deployed successfully!");
    const address = await contract.getAddress();
    console.log("Contract Address:", address);
    
    const tx = contract.deploymentTransaction();
    
    const encodedConstructorArgs = ""; 
    
    await verify_contract(address, encodedConstructorArgs);

    return address;
}