contract;

mod errors;
mod events;
mod utils;

use ::errors::BondingCurveError;
use ::events::{BuyTokenEvent, SellTokenEvent};
use libraries::BondingCurveAbi;
use ::utils::{eth_in_by_token_out, eth_out_by_token_in, BONDING_CURVE_SUPPLY};

use standards::src20::{SetDecimalsEvent, SetNameEvent, SetSymbolEvent, SRC20, TotalSupplyEvent,};
use std::{
    asset::{
        burn,
        mint_to,
        transfer
    },
    call_frames::msg_asset_id,
    constants::DEFAULT_SUB_ID,
    context::msg_amount,
    hash::Hash,
    storage::storage_string::*,
    string::String,
};



configurable {
    DECIMALS: u8 = 9u8,
    BASE_ASSET_ID: b256 = 0x8494fa8c29ecb86a75d977ccea0db6d1824f8429c717cef4b9b9ae0e29a765a5,
}

storage {
    initialized: bool = false,
    name: StorageString = StorageString {},
    symbol: StorageString = StorageString {},
    total_supply: u64 = 0,
}


impl SRC20 for Contract {
    #[storage(read)]
    fn total_assets() -> u64 {
        1
    }

    #[storage(read)]
    fn total_supply(asset: AssetId) -> Option<u64> {
        if asset == AssetId::default() {
            Some(storage.total_supply.read())
        } else {
            None
        }
    }

    #[storage(read)]
    fn name(asset: AssetId) -> Option<String> {
        if asset == AssetId::default() {
            Some(storage.name.read_slice().unwrap())
        } else {
            None
        }
    }

    #[storage(read)]
    fn symbol(asset: AssetId) -> Option<String> {
        if asset == AssetId::default() {
            Some(storage.symbol.read_slice().unwrap())
        } else {
            None
        }
    }

    #[storage(read)]
    fn decimals(asset: AssetId) -> Option<u8> {
        if asset == AssetId::default() {
            Some(DECIMALS)
        } else {
            None
        }
    }
}

impl BondingCurveAbi for Contract {
    #[storage(read, write)]
    fn initialize(name: str, symbol: str) -> bool {
        require(!storage.initialized.read(), BondingCurveError::InitializedPool);
        storage.initialized.write(true);
        storage.name.write_slice(String::from_ascii_str(name));
        storage.symbol.write_slice(String::from_ascii_str(symbol));
        let asset = AssetId::default();
        let sender = msg_sender().unwrap();
        SetNameEvent::new(asset, Some(String::from_ascii_str(name)), sender).log();
        SetSymbolEvent::new(asset, Some(String::from_ascii_str(symbol)), sender).log();
        SetDecimalsEvent::new(asset, DECIMALS, sender).log();
        TotalSupplyEvent::new(asset, 0, sender).log();
        true
    }

    #[storage(read)]
    fn eth_in_by_token_out(token_out: u64) -> u64{
        eth_in_by_token_out(storage.total_supply.read() / 10.pow(DECIMALS.as_u32()), token_out)
    }

    #[storage(read)]
    fn eth_out_by_token_in(token_in: u64) -> u64{
        eth_out_by_token_in(storage.total_supply.read() / 10.pow(DECIMALS.as_u32()), token_in)
    }


    #[storage(read, write), payable]
    fn buy_token(recepient: Identity, amount: u64, max_eth_in: u64) -> u64 {
        require(storage.initialized.read(), BondingCurveError::UninitializedPool);
        require(msg_asset_id() == AssetId::from(BASE_ASSET_ID), BondingCurveError::WrongAsset); // is eth in
        let no_decimals_total_supply = storage.total_supply.read() / 10.pow(DECIMALS.as_u32());
        require(no_decimals_total_supply + amount <= BONDING_CURVE_SUPPLY, BondingCurveError::TotalSupplyExceeded);
        let eth_in = eth_in_by_token_out(no_decimals_total_supply, amount);
        require(eth_in <= msg_amount(), BondingCurveError::InsufficientFunds);
        require(eth_in <= max_eth_in, BondingCurveError::SlippageLimitExceeded);
        let eth_left = msg_amount() - eth_in;
        if  eth_left > 0 {
            transfer(recepient, AssetId::from(BASE_ASSET_ID), eth_left); // return if remaining
        }
        // mint and increase total supply
        mint_to(recepient, DEFAULT_SUB_ID, amount * 10.pow(DECIMALS.as_u32()));  // include decimals
        let new_total_supply = (no_decimals_total_supply + amount) * 10.pow(DECIMALS.as_u32());
        storage.total_supply.write(new_total_supply);
        TotalSupplyEvent::new(AssetId::default(), new_total_supply, msg_sender().unwrap()).log();
        eth_in
    }

    #[storage(read, write), payable]
    fn sell_token(recepient: Identity, amount: u64, min_eth_out: u64) -> u64 {
        require(storage.initialized.read(), BondingCurveError::UninitializedPool);
        let asset = AssetId::default();
        require(msg_asset_id() == asset, BondingCurveError::WrongAsset);
        require(amount * 10.pow(DECIMALS.as_u32()) == msg_amount(), BondingCurveError::InvalidFundsAmount);  // include decimals
        let no_decimals_total_supply = storage.total_supply.read() / 10.pow(DECIMALS.as_u32());
        let eth_out = eth_out_by_token_in(no_decimals_total_supply, amount);
        require(eth_out >= min_eth_out, BondingCurveError::SlippageLimitExceeded);
        transfer(recepient, AssetId::from(BASE_ASSET_ID), eth_out);
        // burn and reduce total supply
        burn(DEFAULT_SUB_ID, amount * 10.pow(DECIMALS.as_u32()));  // include decimals
        let new_total_supply = (no_decimals_total_supply - amount) * 10.pow(DECIMALS.as_u32());
        storage.total_supply.write(new_total_supply);
        TotalSupplyEvent::new(asset, new_total_supply, msg_sender().unwrap()).log();
        eth_out
    }

}
