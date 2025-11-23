import { abi } from "./Abi";
import { bytecode } from "./bytecode";
import { BrowserProvider, ContractFactory } from "ethers";
const { ethers } = require("ethers");

export async function  interact(address){
    if (!window.ethereum) {
        throw new Error("MetaMask or other Ethereum provider not found.");
    }
    const provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); 
    const signer = await provider.getSigner();  
const contract = new ethers.Contract(address, abi, signer);    
const hello = await contract.hello_world();
    return hello;
}