library;

abi BondingCurveAbi {
    #[storage(read, write)]
    fn initialize(name: str, symbol: str) -> bool;

    #[storage(read)]
    fn eth_in_by_token_out(token_out: u64) -> u64;
    #[storage(read)]
    fn eth_out_by_token_in(token_in: u64) -> u64;

    #[storage(read, write), payable]
    fn buy_token(recepient: Identity, amount: u64, max_eth_in: u64) -> u64;

    #[storage(read, write), payable]
    fn sell_token(recepient: Identity, amount: u64, min_eth_out: u64) -> u64;
}