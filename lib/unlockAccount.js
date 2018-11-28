'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.unlockWallet_cli = exports.unlockWallet = undefined;

var _ethers = require('ethers');

var _accountHelpers = require('./accountHelpers');

var fs = require('fs');
var path = require('path');
require('dotenv').config();


// Directory for storing accounts
var ACCOUNTS_DIR = process.env.ACCOUNTS_DIR;

/** HELPER FUNCTIONS **/

function callback_decrypt(progress) {
    var percentComplete = parseInt(progress * 100);
    if (percentComplete % 20 == 0) {
        console.log("Decrypting: " + percentComplete + "% complete");
    }
}

/** PUBLIC FUNCTIONS **/

// Decrypt walletJSON file with password
var unlockWallet = exports.unlockWallet = async function unlockWallet(encryptedJsonFile, password) {
    try {
        var data = await fs.readFileSync(path.join(ACCOUNTS_DIR, encryptedJsonFile));
        return await _ethers.ethers.Wallet.fromEncryptedJson(data, password, callback_decrypt);
    } catch (err) {
        throw err;
    }
};

// Command-line interface for unlockWallet() 
var unlockWallet_cli = exports.unlockWallet_cli = async function unlockWallet_cli() {
    // @dev The readline module provides an interface for 
    // reading data from a Readable stream (such as process.stdin) 
    // one line at a time
    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var accounts = await (0, _accountHelpers.printAllAccounts)();

    // Prompt user to specify a wallet to unlock
    var encryptedJson = void 0;
    rl.question('Please enter the index of the wallet JSON file to unlock from the above list, (e.g. enter 0, 1, 2, etc.): ', async function (walletIndex) {
        if (isNaN(walletIndex) || walletIndex < 0 || walletIndex >= accounts.length) {
            rl.close();
            console.log('invalid wallet index');
            return;
        }
        var encryptedJson = accounts[walletIndex];

        // Prompt user to enter password for chosen wallet
        rl.question('Please enter your wallet password: ', async function (pw) {
            try {
                rl.close();
                var decryptedJsonWallet = await unlockWallet(encryptedJson, pw);
                console.log("Unlocked!" + "\npublicKey: " + decryptedJsonWallet.signingKey.address + "\nprivateKey: " + decryptedJsonWallet.signingKey.privateKey);
                return;
            } catch (err) {
                rl.close();
                console.log('incorrect password');
                return;
            }
        });
    });
};