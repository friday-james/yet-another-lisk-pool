const { transaction } = require('lisk-elements').default;
const readline = require('readline');
const config = require('../config.json');
const {
    getBalanceFile,
    overideBalanceFile,
    saveSignedTransactions,
} = require('./utils/file.js');
const { toRawLsk } = require('./utils/lisk.js');

const passphrase = process.argv[2];
const secondPassphrase = process.argv[3];

const getPayoutAddresses = ({ accounts }) =>
    Object.keys(accounts).filter(
        address => accounts[address].pending > config.minPayout,
    );

const getSignedTransactions = data =>
    data.map(({ address, amount }) =>
        transaction.transfer({
            recipientId: address,
            amount: toRawLsk(amount),
            passphrase,
            secondPassphrase,
        }),
    );

const verifySender = data => data.find(e => e.senderPublicKey === config.delegatePubKey);

const omit = (ids, obj) =>
    Object.keys(obj)
        .filter(id => !ids.includes(id))
        .reduce(
            (acc, id) => ({
                ...acc,
                [id]: obj[id],
            }),
            {},
        );

(async () => {
    const data = getBalanceFile();
    const addressIds = getPayoutAddresses(data);
    const accountsToPay = addressIds.map(id => ({
        address: id,
        amount: data.accounts[id].pending - 0.1,
    }));

    console.log('Sign transactions...');
	const valid = verifySender(getSignedTransactions(accountsToPay));
	if (!valid) {
		throw 'Sender PubKey doesn\'t match the config file';
	};
    const signedTransactions = getSignedTransactions(accountsToPay);
    console.log('Save signed transactions to file...');
    saveSignedTransactions(signedTransactions);
    verifySender(signedTransactions);
    console.log('Remove signed transactions addresses from balance file');
    const updatedData = omit(addressIds, data.accounts);
    data.accounts = updatedData;
    //overideBalanceFile(data);
})();
