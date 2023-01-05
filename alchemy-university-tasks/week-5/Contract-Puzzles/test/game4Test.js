const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { assert } = require('chai');

describe('Game4', function () {
  async function deployContractAndSetVariables() {
    const Game = await ethers.getContractFactory('Game4');
    const game = await Game.deploy();

    const signer = ethers.provider.getSigner(0);
    const signerAddress = await signer.getAddress();

    return { game, signerAddress };
  }
  it('should be a winner', async function () {
    const { game, signerAddress } = await loadFixture(deployContractAndSetVariables);

    // nested mappings are rough :}
    await game.write(signerAddress);

    await game.win(signerAddress);

    // leave this assertion as-is
    assert(await game.isWon(), 'You did not win the game');
  });
});
