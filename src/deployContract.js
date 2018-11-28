var Web3 = require('web3');
import { ethers } from 'ethers';
var fs = require('fs');
const GasBoyABI = require('../contracts/GasBoy.json')
require('dotenv').config() 
const path = require('path')
import { unlockWallet } from './unlockAccount.js'
import { printAllAccounts,  } from './accountHelpers'

export const getWeb3 = () => {
    var web3node = 'wss://ropsten.infura.io/ws'
    const myWeb3 = new Web3(new Web3.providers.WebsocketProvider(web3node))
    return myWeb3
}

const CONTRACTS_DIR = process.env.CONTRACTS_DIR
const getContract = (jsonFile) => {
    let web3 = getWeb3()
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    const instance = new web3.eth.Contract(abi)
    return instance
}

const getDeployer = async (encryptedJsonFile, password) => {
    let web3 = getWeb3()
    try {
        let wallet = await unlockWallet(encryptedJsonFile, password)
        let deployer = web3.eth.accounts.privateKeyToAccount(wallet.signingKey.privateKey)
        return deployer
    } catch (err) {
        throw err
        return
    }
}

export const deployContract = async () => {
    // 1. Get contract instance
    let contractFile = "GasBoy.json";
    let contractJson = path.join(CONTRACTS_DIR, contractFile)
    let GasBoy = getContract(contractJson)
    let bytecode = (JSON.parse(await fs.readFileSync(contractJson, 'utf8'))).bytecode
    // console.log(bytecode)
    
    // 2. Get deployer account to deploy contract from
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    let accounts = await printAllAccounts()
    
    let deployer
    rl.question("Please enter the index of the account to deploy from (e.g. 1, 2, 3 etc.): \n", async (walletIndex) => {
        if (isNaN(walletIndex) || walletIndex < 0 || walletIndex >= accounts.length) {
            rl.close()
            console.log('invalid wallet index')
            return
        }
        let encryptedJson = accounts[walletIndex]

        // Prompt user to enter password for chosen wallet
        rl.question('Please enter your wallet password: ', async (password) => {
            try {
                rl.close();
                try {
                    deployer = await getDeployer(encryptedJson, password)
                    // 3. Check if deployment is valid
                    let deploymentData = GasBoy.deploy({
                        data: bytecode
                    })
                    let gasEstimate
                    try {
                        gasEstimate = await deploymentData.estimateGas()
                        // console.log(gasEstimate)
                    } catch (err) {
                        console.log('EXITING: deployment will fail')
                        return
                    }


                    // 4. Check if account has enough ETH
                    let ethbalance
                    let web3 = getWeb3()
                    try {
                        ethbalance = await web3.eth.getBalance(deployer.address)    
                    } catch(err) {
                        console.log("EXITING: unable to retrieve user's ETH balance")
                        return
                    }
                     
                    if (ethbalance < gasEstimate) {
                        console.log('WARNING: deployment will likely fail. Estimated deployment cost: ' + gasEstimate + ', your balance: ' + ethbalance)
                    }

                    // 5. Submit transaction
                    let deploymentTxn = {
                        nonce: await web3.eth.getTransactionCount(deployer.address),
                        data: deploymentData.encodeABI(),
                        gas: Math.ceil(gasEstimate*1.2),
                        gasPrice: web3.utils.toWei('25', 'gwei')
                    }
                    deployer.signTransaction(deploymentTxn).then(sig => {
                        web3.eth.sendSignedTransaction(sig.rawTransaction)
                        .on('transactionHash', function(hash) {
                            console.log("pending deployment hash: ", hash)
                        })
                        .on('receipt', function(receipt) {
                            console.log('SUCCESSFULLY DEPLOYED GASBOY PROXY CONTRACT! transaction receipt: ', receipt.transactionHash)
                            return
                        })
                        .on('error', function(error) {
                            console.log('EXITING: deployment failed')
                            return
                        })
                    })

                } catch(err) {
                    console.log('EXITING: unable to unlock wallet')
                    return
                }
            } catch(err) {
                rl.close()
                console.log('incorrect password')
                return
            }
        });
    })

    // let encryptedJsonFile = "1543436169108.json"
    // let password = "password"
}