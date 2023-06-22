'use strict';
const fs = require('fs');
const { readFileSync, writeFileSync } = fs;

const CONTRACT_ADDRESS_SNAPSHOT = './snapshot_data/contract_addresses.json';

function jsonFileToObjectSync(filePath) {
  return JSON.parse(readFileSync(filePath));
}

/**
 * Assign roles to ethereum accounts
 * @param {*} networkAccounts List of ethereum accounts on network
 */
function accountRoleAssigner(networkAccounts) {
  const [bankDeployAdmin, player] = networkAccounts;

  return {
    bankDeployAdmin,
    player,
  };
}

/**
 * Write smart contract snapshot address to JSON file
 * @param {*} contractAddressesObj Smart contracts snapshot object
 * @param {*} append  Append to or override the content of snapshot file
 */
async function writeContractsSnapshotAsync(contractAddressesObj, append) {
  let contractAddresses = {};
  let content;

  if (append) {
    if (fs.existsSync(CONTRACT_ADDRESS_SNAPSHOT)) {
      contractAddresses = jsonFileToObjectSync(CONTRACT_ADDRESS_SNAPSHOT);
    }
    const appended = Object.assign(contractAddresses, contractAddressesObj);
    content = JSON.stringify(appended, null, 2);
  } else {
    content = JSON.stringify(contractAddressesObj, null, 2);
  }
  writeFileSync(CONTRACT_ADDRESS_SNAPSHOT, content);
}

module.exports = {
  writeContractsSnapshotAsync,
  accountRoleAssigner,
  jsonFileToObjectSync,
};
