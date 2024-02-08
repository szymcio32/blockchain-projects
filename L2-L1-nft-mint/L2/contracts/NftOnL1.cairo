%lang starknet

from openzeppelin.access.ownable.library import Ownable

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero

from starkware.starknet.common.messages import send_message_to_l1
from starkware.starknet.common.syscalls import get_caller_address

//
// Storage
//

@storage_var
func nftsCounterMintedFromL2(l2_user: felt) -> (res: felt) {
}

@storage_var
func l1ContractAddress() -> (res: felt) {
}

@storage_var
func l1UserAddress(l2_user: felt) -> (res: felt) {
}

//
// Constructor
//

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(owner: felt) {
    Ownable.initializer(owner);
    return ();
}

//
// Getters
//

@view
func get_nfts_minted_from_l2_count{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(l2_user: felt) -> (amount: felt) {
    let (amount) = nftsCounterMintedFromL2.read(l2_user);
    return (amount=amount);
}

@view
func get_l1_contract_address{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (l1_contract: felt) {
    let (l1_contract) = l1ContractAddress.read();
    return (l1_contract=l1_contract);
}

@view
func get_l1_user_address{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(l2_user) -> (l1_user: felt) {
    let (l1_user) = l1UserAddress.read(l2_user=l2_user);
    return (l1_user=l1_user);
}

//
// Externals
//

@external
func create_l1_nft{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(l1_user: felt) {
    let (l1_contract) = l1ContractAddress.read();
    assert_not_zero(l1_contract);
    assert_not_zero(l1_user);

    let (sender_address) = get_caller_address();
    l1UserAddress.write(sender_address, l1_user);

    let (message_payload: felt*) = alloc();
    assert message_payload[0] = l1_user;
    send_message_to_l1(
        to_address=l1_contract,
        payload_size=1,
        payload=message_payload,
    );

    return ();
}

@external
func set_l1_contract_address{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(l1_contract: felt) {
    Ownable.assert_only_owner();
    l1ContractAddress.write(l1_contract);
    return ();
}

//
// L1 Handler
//

@l1_handler
func handle_l1_nft_mint{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(from_address: felt, l2_user: felt, l1_user: felt) {
    let (l1_contract) = l1ContractAddress.read();
    with_attr error_message("Message was not sent by the official L1 contract") {
        assert from_address = l1_contract;
    }
    let (actual_l1_user) = l1UserAddress.read(l2_user);
    with_attr error_message("Not the same L1 user") {
        assert actual_l1_user = l1_user;
    }

    let (res) = nftsCounterMintedFromL2.read(l2_user=l2_user);
    nftsCounterMintedFromL2.write(l2_user, res + 1);

    return ();
}