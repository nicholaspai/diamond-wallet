import { ethers } from 'ethers';
const fs = require('fs')
const path = require('path')
require('dotenv').config() 
import { printAllAccounts } from './accountHelpers'

// Directory for storing accounts
let ACCOUNTS_DIR = process.env.ACCOUNTS_DIR

/** HELPER FUNCTIONS **/

function callback_decrypt(progress) {
    let percentComplete = parseInt(progress * 100)
    if ( percentComplete%20 == 0 ) {
        console.log("Decrypting: " + percentComplete + "% complete");
    }
}

/** PUBLIC FUNCTIONS **/

// Decrypt walletJSON file with password
export const unlockWallet = async (encryptedJsonFile, password) => {
    try {
        let data = await fs.readFileSync(path.join(ACCOUNTS_DIR,encryptedJsonFile))
        return await ethers.Wallet.fromEncryptedJson(data, password, callback_decrypt)
    } catch(err) {
        throw err
    }
}

// Command-line interface for unlockWallet() 
export const unlockWallet_cli = async () => {
    // @dev The readline module provides an interface for 
    // reading data from a Readable stream (such as process.stdin) 
    // one line at a time
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

    let accounts = await printAllAccounts()

    // Prompt user to specify a wallet to unlock
    let encryptedJson
    rl.question('Please enter the index of the wallet JSON file to unlock from the above list, (e.g. enter 0, 1, 2, etc.): ', async (walletIndex) => {
        if (isNaN(walletIndex) || walletIndex < 0 || walletIndex >= accounts.length) {
            rl.close()
            console.log('invalid wallet index')
            return
        }
        let encryptedJson = accounts[walletIndex]

        // Prompt user to enter password for chosen wallet
        rl.question('Please enter your wallet password: ', async (pw) => {
            try {
                rl.close();
                let decryptedJsonWallet = await unlockWallet(encryptedJson, pw)
                console.log(
                    "Unlocked!" +
                    "\npublicKey: " + decryptedJsonWallet.signingKey.address +
                    "\nprivateKey: " + decryptedJsonWallet.signingKey.privateKey
                )
                return
            } catch(err) {
                rl.close()
                console.log('incorrect password')
                return
            }
        });
    })
}