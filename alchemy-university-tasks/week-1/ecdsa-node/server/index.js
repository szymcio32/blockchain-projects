const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

/*
Account 1
privateKey:  2e8d6ee58fe43916162857cc6cb3eef542841a95894057dbc354df6c4b55ec47
publicKey:  0439dea10341802cf52350d2602174c8072d5f832cf1cd8f76668a1d63bd0c29fd05035a6356a60d33f4b7d6bfeb2a5e2cb4ea94e10f4830517f5a048893d6065e
address:  d3b6880e1bd6e314c200240dfcb2b822ccb58cc7

Account 2
privateKey:  647e126b66d3552e53c3e1a923632e405f8d2eeb5e7968eef18fdc8caff778f7
publicKey:  0449e5d223c019e0a6a6b431d354625f7aa885e70f910cc783be831b85a863adb260bce92d5d382b18c18d8f2889680236e3df758c53a220610c0e381637686417      
address:  98999cfa0d015963294efe50ea9a2720a5dfaae7

Account 3
privateKey:  01fd97e291c78c00b294ecb7bfe7c3f8f29a64776782c9e3c1cc73675ee6514c
publicKey:  047886a7783b2b09817def633147750768555ee549b3a12ec39ef0825d04aea35d957b75d3f33a94e73bc10236c81c489f357b52a3876fa396959c5f19b68a0741      
address:  feb24fe8b130929fb005d6af76cb500afe8abdf2
*/ 

const balances = {
  "d3b6880e1bd6e314c200240dfcb2b822ccb58cc7": 100,
  "98999cfa0d015963294efe50ea9a2720a5dfaae7": 50,
  "feb24fe8b130929fb005d6af76cb500afe8abdf2": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, sig, recoveryBit } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    // validate signature
    const err = checkSignature(sender, amount, recipient, sig, recoveryBit);
    if (err){
      res.status(400).send({ message: "Not valid signature!" });
    }

    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function checkSignature(sender, amount, recipient, sig, recoveryBit){
    const msgHash = keccak256(Uint8Array.from([
      sender, parseInt(amount), recipient
    ]));

    const recoveredPublicKey = secp.recoverPublicKey(msgHash, sig, recoveryBit)
    const publicKeyHash = keccak256(recoveredPublicKey.slice(1));
    const recoveredAddress = publicKeyHash.slice(-20);

    if (sender !== toHex(recoveredAddress)){
      return true;
    }
}