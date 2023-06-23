'use strict';

const BankFixed = artifacts.require('BankFixed');

const { writeContractsSnapshotAsync, accountRoleAssigner } = require('../helpers/utils');

module.exports = function(deployer, network, accounts) {
  const { bankDeployAdmin, player } = accountRoleAssigner(accounts);

  deployer
    .then(async () => {
      const bank = await deployer.deploy(BankFixed, player, { from: bankDeployAdmin });
      const tokenAssetAddress = await bank.token();

      const contractAddresses = {
        BankFixed: bank.address,
        TokenAssetFixed: tokenAssetAddress,
      };

      await writeContractsSnapshotAsync(contractAddresses, true);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};
