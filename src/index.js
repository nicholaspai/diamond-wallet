import { createRandomWallet, createRandomWallet_cli } from './createAccount.js'
import { unlockWallet, unlockWallet_cli } from './unlockAccount.js'
import { printAddresses, printBalances } from './accountHelpers'
import { deployContract } from './deployContract'

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const main = async () => {

        const menu =    "\n== CARBON DIAMOND WALLET MENU ==" +
                        "\nPlease enter a number:" +
                        "\n(1): list all addresses" +
                        "\n(2): create a new account" +
                        "\n(3): unlock an existing account" +
                        "\n(4): list ETH balances of all addresses" +
                        "\n(5): deploy a gasboy proxy smart contract" +
                        "\n"

        rl.question(menu, async (action) => {
            rl.close()

            switch(action) {
                case '1':
                    await printAddresses()
                    break;
                case '2':
                    await createRandomWallet_cli()
                    break;  
                case '3':
                    await unlockWallet_cli()
                    break; 
                case '4':
                    await printBalances()
                    break; 
                case '5':
                    await deployContract()
                    break; 
                default:
                    console.log('invalid menu choice')
            }
        })
}

// START
main()