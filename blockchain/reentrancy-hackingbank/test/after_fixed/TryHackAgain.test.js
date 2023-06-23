const { expect } = require('chai');
const { fromWei, toWei } = require('web3-utils');

const BankFixed = artifacts.require('BankFixed');
const TokenAssetFixed = artifacts.require('TokenAssetFixed');
const AttackContract = artifacts.require('AttackContract');

const time = require('../../helpers/time');
const { assertRevert } = require('../../helpers/evm_revert');

const contractAddresses = require('../../snapshot_data/contract_addresses.json');
const { bankDeployAdmin, player } = require('../../snapshot_data/participants.json');

contract('Hack the Bank again after all contracts got fixed', function() {
  let bankContract;
  let tokenContract;

  let attackContract;

  const PLAYER_INIT_BANK_BALANCE = 500000;
  let BANK_TOTAL_FUND_SUPPLY;

  let playerInitBankBalance;
  let playerInitTokenBalance;

  before(async function() {
    this.snapshotId = await time.takeSnapshot();
    bankContract = await BankFixed.at(contractAddresses.BankFixed);
    tokenContract = await TokenAssetFixed.at(contractAddresses.TokenAssetFixed);
    attackContract = await AttackContract.at(contractAddresses.AttackContract);

    // change attack target to BankFixed
    await attackContract.changeAttackTarget(bankContract.address, { from: player });

    BANK_TOTAL_FUND_SUPPLY = Number(fromWei(await tokenContract.totalSupply()));
  });

  after(async function() {
    await time.revertToSnapshot(this.snapshotId.result);
  });

  it('should changed the attack target to BankFixed contract', async function() {
    expect(await attackContract.getCurrentTargetBank()).to.be.equal(bankContract.address);
  });

  describe('Bank still functioning as before', function() {
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
  });

  describe('However no longer able to hack', function() {
    it('[!!!] AttackContract trigger the heist, but transaction reverted', async function() {
      const attackContractTokenBalBefore = Number(fromWei(await tokenContract.balanceOf(attackContract.address)));
      // only withdraw a half of balance to trigger the second invocation to tokenFallback of AttackContract
      await assertRevert(attackContract.triggerAttack(toWei(String(PLAYER_INIT_BANK_BALANCE / 2)), { from: player }));

      const attackContractTokenBalAfter = Number(fromWei(await tokenContract.balanceOf(attackContract.address)));
      //  No change in balance of attack contract
      const change = attackContractTokenBalAfter - attackContractTokenBalBefore;
      expect(change).to.be.equal(0);
    });

    it("Bank's balance still remain even after the hack was triggered", async function() {
      const remain = Number(fromWei(await tokenContract.balanceOf(bankContract.address)));
      expect(remain).to.be.equal(BANK_TOTAL_FUND_SUPPLY);
    });

    it("The other Bank's customer can withdraw as usual", async function() {
      const customerBankBalance = Number(fromWei(await bankContract.balanceOf(bankDeployAdmin)));
      await bankContract.withdraw(toWei(String(customerBankBalance)), { from: bankDeployAdmin });

      const customerTokenBalance = Number(fromWei(await tokenContract.balanceOf(bankDeployAdmin)));
      expect(customerTokenBalance).to.be.equal(customerBankBalance);
    });
  });
});
