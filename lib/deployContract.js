'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.deployContract = exports.getWeb3 = undefined;

var _ethers = require('ethers');

var _unlockAccount = require('./unlockAccount.js');

var _accountHelpers = require('./accountHelpers');

var Web3 = require('web3');

var fs = require('fs');
var GasBoyABI = require('../contracts/GasBoy.json');
require('dotenv').config();
var path = require('path');
var getWeb3 = exports.getWeb3 = function getWeb3() {
    var web3node = 'wss://ropsten.infura.io/ws';
    var myWeb3 = new Web3(new Web3.providers.WebsocketProvider(web3node));
    return myWeb3;
};

var CONTRACTS_DIR = process.env.CONTRACTS_DIR;
var getContract = function getContract(jsonFile) {
    var web3 = getWeb3();
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    var instance = new web3.eth.Contract(abi);
    return instance;
};

var getDeployer = async function getDeployer(encryptedJsonFile, password) {
    var web3 = getWeb3();
    try {
        var wallet = await (0, _unlockAccount.unlockWallet)(encryptedJsonFile, password);
        var deployer = web3.eth.accounts.privateKeyToAccount(wallet.signingKey.privateKey);
        return deployer;
    } catch (err) {
        throw err;
        return;
    }
};

var deployContract = exports.deployContract = async function deployContract() {
    // 1. Get contract instance
    var contractFile = "GasBoy.json";
    var contractJson = path.join(CONTRACTS_DIR, contractFile);
    var GasBoy = getContract(contractJson);
    var bytecode = JSON.parse((await fs.readFileSync(contractJson, 'utf8'))).bytecode;
    // console.log(bytecode)

    // 2. Get deployer account to deploy contract from
    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var accounts = await (0, _accountHelpers.printAllAccounts)();

    var deployer = void 0;
    rl.question("Please enter the index of the account to deploy from (e.g. 1, 2, 3 etc.): \n", async function (walletIndex) {
        if (isNaN(walletIndex) || walletIndex < 0 || walletIndex >= accounts.length) {
            rl.close();
            console.log('invalid wallet index');
            return;
        }
        var encryptedJson = accounts[walletIndex];

        // Prompt user to enter password for chosen wallet
        rl.question('Please enter your wallet password: ', async function (password) {
            try {
                rl.close();
                try {
                    deployer = await getDeployer(encryptedJson, password);
                    // 3. Check if deployment is valid
                    var deploymentData = GasBoy.deploy({
                        data: bytecode
                    });
                    var gasEstimate = void 0;
                    try {
                        gasEstimate = await deploymentData.estimateGas();
                        // console.log(gasEstimate)
                    } catch (err) {
                        console.log('EXITING: deployment will fail');
                        return;
                    }

                    // 4. Check if account has enough ETH
                    var ethbalance = void 0;
                    var web3 = getWeb3();
                    try {
                        ethbalance = await web3.eth.getBalance(deployer.address);
                    } catch (err) {
                        console.log("EXITING: unable to retrieve user's ETH balance");
                        return;
                    }

                    if (ethbalance < gasEstimate) {
                        console.log('WARNING: deployment will likely fail. Estimated deployment cost: ' + gasEstimate + ', your balance: ' + ethbalance);
                    }

                    // 5. Submit transaction
                    var deploymentTxn = {
                        nonce: await web3.eth.getTransactionCount(deployer.address),
                        data: deploymentData.encodeABI(),
                        gas: Math.ceil(gasEstimate * 1.2),
                        gasPrice: web3.utils.toWei('25', 'gwei')
                    };
                    deployer.signTransaction(deploymentTxn).then(function (sig) {
                        web3.eth.sendSignedTransaction(sig.rawTransaction).on('transactionHash', function (hash) {
                            console.log("pending deployment hash: ", hash);
                        }).on('receipt', function (receipt) {
                            console.log('SUCCESSFULLY DEPLOYED GASBOY PROXY CONTRACT! transaction receipt: ', receipt.transactionHash);
                            return;
                        }).on('error', function (error) {
                            console.log('EXITING: deployment failed');
                            return;
                        });
                    });
                } catch (err) {
                    console.log('EXITING: unable to unlock wallet');
                    return;
                }
            } catch (err) {
                rl.close();
                console.log('incorrect password');
                return;
            }
        });
    });

    // let encryptedJsonFile = "1543436169108.json"
    // let password = "password"
};