'use strict';

const UnsecuredBank = artifacts.require('UnsecuredBank');

const { writeContractsSnapshotAsync, accountRoleAssigner } = require('../helpers/utils');

module.exports = function(deployer, network, accounts) {
  const { bankDeployAdmin, player } = accountRoleAssigner(accounts);

  deployer
    .then(async () => {
      const bank = await deployer.deploy(UnsecuredBank, player, { from: bankDeployAdmin });
      const tokenAssetAddress = await bank.token();

      const contractAddresses = {
        UnsecuredBank: bank.address,
        TokenAsset: tokenAssetAddress,
      };

      await writeContractsSnapshotAsync(contractAddresses);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};
