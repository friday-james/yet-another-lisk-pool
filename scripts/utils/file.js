const fs = require('jsonfile');
const config = require('../../config.json');
const path = require('path');
const { updateRewards } = require('./lisk.js');

const BALANCE_FILE = path.resolve('data/balance.json');
const BACKUP_FILE = path.resolve('backup');
const SIGNED_TRANSACTION_FILE = path.resolve('data/payout.json');

const getBalanceFile = () => {
    try {
        return fs.readFileSync(BALANCE_FILE);
    } catch (error) {
        const data = {
            lastpayout: config.epochPoolTime*1000,
            accounts: {},
        };
        fs.writeFileSync(BALANCE_FILE, data, { spaces: 2 });
        return data;
    }
};

const overideBalanceFile = data => {
    var t = new Date(data['lastpayout']).toLocaleDateString().replace(/\//g, "-");
    var path = BACKUP_FILE + "/balance_" + t + ".json";
    console.log(path);
    fs.writeFileSync(path, data, { spaces: 2 });
    fs.writeFileSync(BALANCE_FILE, data, { spaces: 2 });
};

// Update and save data to file
const saveRewards = (data, rewards, date) => {
    try {
        const updatedData = updateRewards(data, rewards, date);
        fs.writeFileSync(BALANCE_FILE, data, { spaces: 2 });
        var t = new Date(data['lastpayout']).toLocaleDateString().replace(/\//g, "-");
        var path = BACKUP_FILE + '/balance_' + t + '.json';
        console.log(path);
        fs.writeFileSync(path, data, { spaces: 2 });
    } catch (error) {
        console.error('Cant write to file', error.message);
    }
};

const saveSignedTransactions = data =>
    fs.writeFileSync(SIGNED_TRANSACTION_FILE, data, { spaces: 2 });

const getSignedTransactionsFile = () => {
    try {
        return fs.readFileSync(SIGNED_TRANSACTION_FILE);
    } catch (error) {
        console.log("Can't read payout.json file");
        return [];
    }
};

module.exports = {
    saveRewards,
    getBalanceFile,
    overideBalanceFile,
    saveSignedTransactions,
    getSignedTransactionsFile,
};
