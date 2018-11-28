'use strict';

var _createAccount = require('./createAccount.js');

var _unlockAccount = require('./unlockAccount.js');

var _accountHelpers = require('./accountHelpers');

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var main = async function main() {

    var menu = "\n== CARBON DIAMOND WALLET MENU ==" + "\nPlease enter a number:" + "\n(1): list all addresses" + "\n(2): create a new account" + "\n(3): unlock an existing account" + "\n(4): list ETH balances of all addresses" + "\n";

    rl.question(menu, async function (action) {
        rl.close();
        switch (action) {
            case '1':
                await (0, _accountHelpers.printAddresses)();
                break;
            case '2':
                await (0, _createAccount.createRandomWallet_cli)();
                break;
            case '3':
                await (0, _unlockAccount.unlockWallet_cli)();
                break;
            case '4':
                await (0, _accountHelpers.printBalances)();
                break;
            default:
                console.log('invalid menu choice');
        }
    });
};

// START
main();