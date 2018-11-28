'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createRandomWallet_cli = exports.createRandomWallet = undefined;

var _ethers = require('ethers');

var fs = require('fs');
var path = require('path');
require('dotenv').config();

// Directory for storing accounts
var ACCOUNTS_DIR = process.env.ACCOUNTS_DIR;

/** HELPER FUNCTIONS **/

// See docs.ethers.io: If the progressCallback is specified, 
// it will be called periodically during encryption with a value between 0 and 1, 
// inclusive indicating the progress.
function callback_encrypt(progress) {
    var percentComplete = parseInt(progress * 100);
    if (percentComplete % 20 == 0) {
        console.log("Encrypting: " + percentComplete + "% complete");
    }
}

// Write JSON object to new file identified by unique timestamp
var jsonToFileUnique = async function jsonToFileUnique(json) {
    var date = new Date();
    var timestamp = date.getTime();
    var uniqueName = path.join(ACCOUNTS_DIR, timestamp + ".json");
    var err = await fs.writeFileSync(uniqueName, json);
    if (!err) return uniqueName;else throw err;
};

/** PUBLIC FUNCTIONS **/

// Create a new random wallet and encrypt it in JSON form
// @param password Password used to encrypt new JSON wallet
var createRandomWallet = exports.createRandomWallet = async function createRandomWallet(password) {
    var randomWallet = new _ethers.ethers.Wallet.createRandom();
    var encryptedJson = await randomWallet.encrypt(password, callback_encrypt);
    var newWalletJson = await jsonToFileUnique(encryptedJson);
    console.log('Wrote wallet JSON to file: ', newWalletJson);
    return encryptedJson;
};

var createRandomWallet_cli = exports.createRandomWallet_cli = async function createRandomWallet_cli() {
    // @dev The readline module provides an interface for 
    // reading data from a Readable stream (such as process.stdin) 
    // one line at a time
    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Prompt user to enter password to encrypt wallet
    var password = void 0;
    rl.question('Please enter a password to secure your new Ethereum account: ', async function (pw) {
        // TODO: Log the password in an encrypted database
        rl.question('Please re-enter your password: ', async function (_pw) {
            if (pw == _pw) {
                rl.close();
                password = _pw;
                console.log('Password verified!');

                var encryptedJson = await createRandomWallet(password);
                var address = _ethers.ethers.utils.getJsonWalletAddress(encryptedJson);
                console.log('new public key: ', address);
                return;
            } else {
                rl.close();
                console.log('incorrect password');
                return;
            }
        });
    });
};