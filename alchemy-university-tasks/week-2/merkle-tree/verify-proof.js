function verifyProof(proof, node, root, concat) {
    let currentProof = '';
    let itemToHash = node; 
    proof.forEach(elem => {
        itemToHash = elem['left'] === true ? concat(elem['data'], itemToHash) : concat(itemToHash, elem['data']);
        currentProof += itemToHash;
    })
    return itemToHash === root;
}

module.exports = verifyProof;
