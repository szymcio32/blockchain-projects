const crypto = require("crypto");

class MerkleTree {
  constructor(leaves, concat) {
    this.leaves = leaves;
    this.concat = concat;
  }

  _getCombinedHash(left, right) {
    if (!right) {
      return left;
    }
    return this.concat(left, right)
  }

  _getRoot(currentLayer) {
    if (currentLayer.length === 1) {
      return currentLayer[0];
    }

    let index = 0;
    let nextLayer = []
    while (currentLayer.length > index) {
      const left = currentLayer[index];
      const right = currentLayer[index + 1];
      nextLayer.push(this._getCombinedHash(left, right));
      index += 2;
    }

    return this._getRoot(nextLayer)
  }

  getRoot() {
    return this._getRoot(this.leaves)
  }

  getProof(index) {
    let currentLayer = this.leaves;

    let proof = [];
    while (currentLayer.length > 1) {
      let newLayer = [];

      for (let i = 0; i < currentLayer.length - 1; i += 2) {
        newLayer.push(
          this.concat(currentLayer[i], currentLayer[i + 1])
        );
        if (i === index) {
          proof.push({ data: currentLayer[i + 1], left: false });
        }
        if (i + 1 === index) {
          proof.push({ data: currentLayer[i], left: true });
        }
      }

      let isOdd = currentLayer.length % 2 !== 0;
      if (isOdd) {
        newLayer.push(currentLayer[currentLayer.length - 1]);
      }

      index = Math.floor(index / 2);
      currentLayer = newLayer;
    }

    return proof;
  }
}

module.exports = MerkleTree;