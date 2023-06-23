'use strict';

module.exports = {
  networks: {
    localhost: {
      host: '127.0.0.1',
      network_id: '*', // eslint-disable-line camelcase
      port: 8545,
      gas: 10000000,
    },
  },
  compilers: {
    solc: {
      parser: 'solcjs',
      version: '0.4.21',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  plugins: ['solidity-coverage'],
};
