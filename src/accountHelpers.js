import { ethers } from 'ethers';
const fs = require('fs')
const path = require('path')
require('dotenv').config() 

// Directory for storing accounts
let ACCOUNTS_DIR = process.env.ACCOUNTS_DIR

export function listAllAccounts() {
    let filenames = fs.readdirSync(ACCOUNTS_DIR);
    var accounts = []
    filenames.forEach(function(filename) {
        accounts.push(filename)
    });
    return accounts
}

export async function printAllAccounts() {
    let accounts = listAllAccounts()
    let addresses = await getAddresses()
    var i = 0
    accounts.forEach(async function(account) {
        console.log((i)+": "+account+", address => "+addresses[i])
        i++
    });
    return accounts
}

export async function getAddresses() {
    let accounts = listAllAccounts()
    var addresses = []
    await accounts.forEach(async function(account) {
        let data = await fs.readFileSync(path.join(ACCOUNTS_DIR,account));
        let address = ethers.utils.getJsonWalletAddress(data.toString());
        addresses.push(address)
    });
    return addresses
}

export async function printAddresses() {
    let addresses = await getAddresses()
    var i = 0
    addresses.forEach(async function(address) {
        console.log((i++)+": "+address)
    });
    return addresses
}

export async function printBalances() {
    let provider = ethers.getDefaultProvider();
    let addresses = await getAddresses()
    let balances = []
    var i = 0
    addresses.forEach(async function(address) {
        let balance = await provider.getBalance(address);
        console.log((i++)+': '+address + ', ETH balance => ' + ethers.utils.formatEther(balance));
    });
}