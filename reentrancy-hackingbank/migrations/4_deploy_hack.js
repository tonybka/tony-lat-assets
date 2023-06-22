'use strict';

const UnsecuredBank = artifacts.require('UnsecuredBank');
const AttackContract = artifacts.require('AttackContract');

const { writeContractsSnapshotAsync, accountRoleAssigner } = require('../helpers/utils');

module.exports = function(deployer, network, accounts) {
  const { player } = accountRoleAssigner(accounts);

  deployer
    .then(async () => {
      const bank = await UnsecuredBank.deployed();
      const attackContract = await deployer.deploy(AttackContract, bank.address, { from: player });

      const contractAddresses = {
        AttackContract: attackContract.address,
      };

      await writeContractsSnapshotAsync(contractAddresses, true);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};
