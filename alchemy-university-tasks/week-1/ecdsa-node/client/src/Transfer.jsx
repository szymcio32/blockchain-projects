import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils.js";
import { useState } from "react";
import server from "./server";

const ADDRESS_PRIVATE_KEY_MAPPING = {
  'd3b6880e1bd6e314c200240dfcb2b822ccb58cc7': '2e8d6ee58fe43916162857cc6cb3eef542841a95894057dbc354df6c4b55ec47',
  '98999cfa0d015963294efe50ea9a2720a5dfaae7': '647e126b66d3552e53c3e1a923632e405f8d2eeb5e7968eef18fdc8caff778f7',
  'feb24fe8b130929fb005d6af76cb500afe8abdf2': '01fd97e291c78c00b294ecb7bfe7c3f8f29a64776782c9e3c1cc73675ee6514c'
}

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const messageData = {
    sender: address,
    amount: parseInt(sendAmount),
    recipient,
  }

  const msgHash = keccak256(Uint8Array.from([
      address, parseInt(sendAmount), recipient
  ]));
  const privateKey = ADDRESS_PRIVATE_KEY_MAPPING[address]
  if (privateKey) {
    secp.sign(msgHash, privateKey, { recovered: true }).then((result) => {
      const [sig, recoveryBit] = result;
      messageData['sig'] = toHex(sig);
      messageData['recoveryBit'] = recoveryBit
    })
  }

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, messageData);
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
