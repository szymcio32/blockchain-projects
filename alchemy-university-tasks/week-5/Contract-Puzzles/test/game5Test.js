const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { assert } = require('chai');

describe('Game5', function () {
  async function deployContractAndSetVariables() {
    const Game = await ethers.getContractFactory('Game5');
    const game = await Game.deploy();

    return { game };
  }
  it('should be a winner', async function () {
    const { game } = await loadFixture(deployContractAndSetVariables);

    // good luck
    const threshold = '0x00FfFFfFFFfFFFFFfFfFfffFFFfffFfFffFfFFFf';
    while (true) {
        signer = ethers.Wallet.createRandom();
        signer = signer.connect(ethers.provider);
        if (signer.address < threshold){
            break;
        }
    }
    const mainAccount = await ethers.provider.getSigner(0);
    await mainAccount.sendTransaction({
        to: signer.address,
        value: ethers.utils.parseEther("0.1")
    });

    await game.connect(signer).win();

    // leave this assertion as-is
    assert(await game.isWon(), 'You did not win the game');
  });
});
