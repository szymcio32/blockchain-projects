const TrieNode = require('./TrieNode');

class Trie {
    constructor() {
        this.root = new TrieNode(null);
    }

    insert(word){
        let currentNode = this.root
        let nextNode;
        for (const letter of word) {
            nextNode = letter in currentNode.children ? currentNode.children[letter] : new TrieNode(letter);
            currentNode.children[letter] = nextNode;
            currentNode = nextNode;
        }
        currentNode.isWord = true;
    }
    
    contains(word){
        let letter;
        let currentNode = this.root;
        for (let i = 0; i < word.length; i++) {
            letter = word[i]
            if (letter in currentNode.children) {
                if (i === word.length - 1) {
                    return currentNode.children[letter].isWord ? true : false;
                }
                currentNode = currentNode.children[letter]
            } else {
                return false;
            }
        }
    }
}

module.exports = Trie;