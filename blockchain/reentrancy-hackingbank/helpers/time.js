const { promisify } = require('util');

async function takeSnapshot() {
  snapshotId = await promisify(web3.currentProvider.send)({
    jsonrpc: '2.0',
    method: 'evm_snapshot',
    params: [],
  });

  return snapshotId;
}

async function revertToSnapshot(snapshotId) {
  await promisify(web3.currentProvider.send)({
    jsonrpc: '2.0',
    method: 'evm_revert',
    params: [snapshotId],
  });
}

module.exports = {
  takeSnapshot,
  revertToSnapshot,
};
