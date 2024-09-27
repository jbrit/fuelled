library;

pub struct BuyTokenEvent {
    pub token_amount: u64,
    pub eth_in: u64,
}

pub struct SellTokenEvent {
    pub token_amount: u64,
    pub eth_out: u64,
}
