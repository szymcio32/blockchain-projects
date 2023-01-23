// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract MultiSig {
    address[] public owners;
    uint256 public required;

    struct Transaction {
        address destination;
        uint256 value;
        bool executed;
        bytes data;
    }
    Transaction[] public transactions;

    mapping(uint256 => mapping(address => bool)) public confirmations;

    constructor(address[] memory _owners, uint256 _required){
        require(_owners.length > 0, "No owner set");
        require(_required > 0, "Number of required confirmations is less than 1");
        require(_required <= _owners.length, "Number of required confirmations is more than the total number of owner addresses");
        owners = _owners;
        required = _required;
    }

    function transactionCount() public view returns(uint256){
        return transactions.length;
    }

    function addTransaction(address _destination, uint256 _value, bytes calldata _data) internal returns(uint256) {
        uint256 transactionId = transactions.length;
        transactions.push(Transaction(_destination, _value, false, _data));
        return transactionId;
    }

    function confirmTransaction(uint256 _transactionId) public {
        bool confirmed = false;
        for (uint256 i; i < owners.length; i++){
            if(owners[i] == msg.sender) {
                confirmations[_transactionId][msg.sender] = true;
                confirmed = true;
                break;
            }
        }
        if (!confirmed) {
            revert("Not an owner");
        }

        executeTransaction(_transactionId);
    }

    function getConfirmationsCount(uint256 _transactionId) public view returns(uint256){
        uint256 confirmationsCount = 0;
        for (uint256 i; i < owners.length; i++){
            if(confirmations[_transactionId][owners[i]]) {
                confirmationsCount += 1;
            }
        }
        return confirmationsCount;
    }

    function submitTransaction(address _destination, uint256 _value, bytes calldata _data) external {
        uint256 transactionId = addTransaction(_destination, _value, _data);
        confirmTransaction(transactionId);
    }

    function isConfirmed(uint256 _transactionId) public view returns(bool) {
        return getConfirmationsCount(_transactionId) >= required;
    }

    function executeTransaction(uint256 _transactionId) internal {
        if (isConfirmed(_transactionId)) {
            Transaction storage _tx = transactions[_transactionId];
            require(_tx.executed == false, "Transaction already exeuted");
            (bool success, ) = _tx.destination.call{ value: _tx.value }(_tx.data);
            require(success, "Failed to execute transaction");
            _tx.executed = true;
        }
    }

    receive() external payable {}
}
