import { ethers } from 'ethers';
const fs = require('fs')
const path = require('path')
require('dotenv').config() 

// Directory for storing accounts
let ACCOUNTS_DIR = process.env.ACCOUNTS_DIR

/** HELPER FUNCTIONS **/

// See docs.ethers.io: If the progressCallback is specified, 
// it will be called periodically during encryption with a value between 0 and 1, 
// inclusive indicating the progress.
function callback_encrypt(progress) {
    let percentComplete = parseInt(progress * 100)
    if ( percentComplete%20 == 0 ) {
        console.log("Encrypting: " + percentComplete + "% complete");
    }
}

// Write JSON object to new file identified by unique timestamp
const jsonToFileUnique = async (json) => {
    let date = new Date()
    let timestamp = date.getTime()
    let uniqueName = path.join(ACCOUNTS_DIR, timestamp+".json")
    let err = await fs.writeFileSync(uniqueName, json)
    if (!err) return uniqueName
    else throw err
}

/** PUBLIC FUNCTIONS **/

// Create a new random wallet and encrypt it in JSON form
// @param password Password used to encrypt new JSON wallet
export const createRandomWallet = async (password) => {
    let randomWallet = new ethers.Wallet.createRandom()
    let encryptedJson = await randomWallet.encrypt(password, callback_encrypt);
    let newWalletJson = await jsonToFileUnique(encryptedJson)
    console.log('Wrote wallet JSON to file: ', newWalletJson)
    return encryptedJson
}

export const createRandomWallet_cli = async () => {
    // @dev The readline module provides an interface for 
    // reading data from a Readable stream (such as process.stdin) 
    // one line at a time
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

    // Prompt user to enter password to encrypt wallet
    let password
    rl.question('Please enter a password to secure your new Ethereum account: ', async (pw) => {
        // TODO: Log the password in an encrypted database
        rl.question('Please re-enter your password: ', async (_pw) => {
            if (pw == _pw) {
                rl.close();
                password = _pw
                console.log(`Password verified!`);

                let encryptedJson = await createRandomWallet(password)
                let address = ethers.utils.getJsonWalletAddress(encryptedJson)
                console.log('new public key: ', address)
                return
            } else {
                rl.close()
                console.log('incorrect password')
                return
            }
        })
    });
}