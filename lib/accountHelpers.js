'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.listAllAccounts = listAllAccounts;
exports.printAllAccounts = printAllAccounts;
exports.getAddresses = getAddresses;
exports.printAddresses = printAddresses;
exports.printBalances = printBalances;

var _ethers = require('ethers');

var _deployContract = require('./deployContract');

var fs = require('fs');
var path = require('path');
require('dotenv').config();

var web3 = (0, _deployContract.getWeb3)();

// Directory for storing accounts
var ACCOUNTS_DIR = process.env.ACCOUNTS_DIR;

// ETH network
var provider = _ethers.ethers.getDefaultProvider('ropsten');

function listAllAccounts() {
    var filenames = fs.readdirSync(ACCOUNTS_DIR);
    var accounts = [];
    filenames.forEach(function (filename) {
        accounts.push(filename);
    });
    return accounts;
}

async function printAllAccounts() {
    var accounts = listAllAccounts();
    var addresses = await getAddresses();
    var i = 0;
    accounts.forEach(async function (account) {
        console.log(i + ": " + account + ", address => " + addresses[i]);
        i++;
    });
    return accounts;
}

async function getAddresses() {
    var accounts = listAllAccounts();
    var addresses = [];
    await accounts.forEach(async function (account) {
        var data = await fs.readFileSync(path.join(ACCOUNTS_DIR, account));
        var address = _ethers.ethers.utils.getJsonWalletAddress(data.toString());
        addresses.push(address);
    });
    return addresses;
}

async function printAddresses() {
    var addresses = await getAddresses();
    var i = 0;
    addresses.forEach(async function (address) {
        console.log(i++ + ": " + address);
    });
    return addresses;
}

async function printBalances() {
    var addresses = await getAddresses();
    var balances = [];
    var i = 0;
    addresses.forEach(async function (address) {
        var balance = await provider.getBalance(address);
        console.log(i++ + ': ' + address + ', ETH balance => ' + _ethers.ethers.utils.formatEther(balance));
    });
}