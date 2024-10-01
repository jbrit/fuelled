library;
use std::string::String;

abi BondingCurveAbi {
    #[storage(read, write)]
    fn initialize(name: String, symbol: String, description: String, image: String, twitter: String, telegram: String, website: String) -> bool;

    #[storage(read)]
    fn eth_in_by_token_out(token_out: u64) -> u64;
    #[storage(read)]
    fn eth_out_by_token_in(token_in: u64) -> u64;

    #[storage(read, write), payable]
    fn buy_token(recepient: Identity, amount: u64, max_eth_in: u64) -> u64;

    #[storage(read, write), payable]
    fn sell_token(recepient: Identity, amount: u64, min_eth_out: u64) -> u64;
}