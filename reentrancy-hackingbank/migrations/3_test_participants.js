'use strict';

const { writeFileSync } = require('fs');
const { accountRoleAssigner } = require('../helpers/utils');

module.exports = function(deployer, network, accounts) {
  const { bankDeployAdmin, player } = accountRoleAssigner(accounts);
  const participantAddresses = {
    bankDeployAdmin,
    player,
  };
  writeFileSync('./snapshot_data/participants.json', JSON.stringify(participantAddresses, null, 2));
};
