const crypto = require("crypto");

class MerkleTree {
    constructor(leaves, concat) {
        this.leaves = leaves;
        this.concat = concat;
        this.tempArrHash = [];
    }

    getCombinedHash(left, right) {
      if (!right) {
        return left;
      }
      return this.concat(left, right)
    }
    
    getNewLeavesHashes(index, arrHash){
      if (arrHash.length <= index){
        return this.tempArrHash;
      }
      const left = arrHash[index];
      const right = arrHash[index+1];
      this.tempArrHash.push(this.getCombinedHash(left, right));
      index += 2;
      return this.getNewLeavesHashes(index, arrHash);
    }
    
    getLeavesHash(arrHash) {
        if (arrHash.length == 1) {
          return arrHash[0];
        }
        arrHash = this.getNewLeavesHashes(0, arrHash)
        this.tempArrHash = []
        return this.getLeavesHash(arrHash)
    }
    getRoot() {
        return this.getLeavesHash(this.leaves)
    }
    getProof(index) {
      let currentLayer = this.leaves;

      let proof = [];
      while (currentLayer.length > 1) {
        let newLayer = [];
        let isOdd = currentLayer.length % 2 !== 0;
        let toRange = isOdd ? currentLayer.length - 1 : currentLayer.length;

        for (let i = 0; i < toRange; i += 2) {
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