contract;

use standards::src12::*;
use std::{
    call_frames::msg_asset_id,
    constants::DEFAULT_SUB_ID,
    context::msg_amount,
    external::bytecode_root,
    hash::{Hash, sha256,},
    storage::storage_vec::*,
};
use sway_libs::bytecode::*;
use libraries::BondingCurveAbi;

// events
enum PoolInitialized {

}


enum MemeFactoryError {
    RegisteredToken: (),
    UnregisteredToken: (),
    InitializedFactory: (),
    UninitializedFactory: (),
    ZeroBytecodeRoot: (),
}

storage {
    registered_assets: StorageMap<AssetId, ContractId> = StorageMap {},
    registered_contracts: StorageMap<ContractId, bool> = StorageMap {},
    template_bytecode_root: b256 = b256::zero(),
}

abi MemeFactoryAbi {
    #[storage(read, write), payable]
    fn buy_token(child_contract: ContractId, amount: u64, max_eth_in: u64) -> u64;

    #[storage(read, write), payable]
    fn sell_token(child_contract: ContractId, amount: u64, min_eth_out: u64) -> u64;

    #[storage(read, write)]
    fn set_bytecode_root(child_contract: ContractId) -> BytecodeRoot;

    #[storage(read)]
    fn get_asset_contract(asset_id: AssetId) -> ContractId;

    /// SRC12 adaptation
    #[storage(read, write)]
    fn register_contract(child_contract: ContractId, name: str, symbol: str) -> Result<BytecodeRoot, str>;

    #[storage(read)]
    fn is_valid(child_contract: ContractId) -> bool;

    #[storage(read)]
    fn factory_bytecode_root() -> Option<BytecodeRoot>;
    
}

impl MemeFactoryAbi for Contract {
    #[storage(read, write), payable]
    fn buy_token(child_contract: ContractId, amount: u64, max_eth_in: u64) -> u64 {
        require(storage.registered_contracts.get(child_contract).try_read().unwrap_or(false), MemeFactoryError::UnregisteredToken);
        let caller_contract = abi(BondingCurveAbi, child_contract.bits());
        caller_contract.buy_token {
            asset_id: msg_asset_id().bits(),
            coins: msg_amount()
        }(amount, max_eth_in)
    }

    #[storage(read, write), payable]
    fn sell_token(child_contract: ContractId, amount: u64, min_eth_out: u64) -> u64 {
        require(storage.registered_contracts.get(child_contract).try_read().unwrap_or(false), MemeFactoryError::UnregisteredToken);
        let caller_contract = abi(BondingCurveAbi, child_contract.bits());
        caller_contract.sell_token {
            asset_id: msg_asset_id().bits(),
            coins: msg_amount()
        }(amount, min_eth_out)
    }

    #[storage(read, write)]
    fn set_bytecode_root(child_contract: ContractId) -> BytecodeRoot {
        require(storage.template_bytecode_root.read() == b256::zero(), MemeFactoryError::InitializedFactory);
        let bytecode_root = bytecode_root(child_contract);
        require(bytecode_root != b256::zero(), MemeFactoryError::ZeroBytecodeRoot);
        storage.template_bytecode_root.write(bytecode_root);
        bytecode_root
    }

    #[storage(read)]
    fn get_asset_contract(asset_id: AssetId) -> ContractId {
        storage.registered_assets.get(asset_id).try_read().unwrap_or(ContractId::zero())
    }

    /// SRC12 adaptation
    #[storage(read, write)]
    fn register_contract(
        child_contract: ContractId,
        name: str,
        symbol: str
    ) -> Result<BytecodeRoot, str> {
        require(storage.template_bytecode_root.read() != b256::zero(), MemeFactoryError::UninitializedFactory);
        require(!storage.registered_contracts.get(child_contract).try_read().unwrap_or(false), MemeFactoryError::RegisteredToken);
        let returned_root = bytecode_root(child_contract);
 
        if returned_root != storage.template_bytecode_root.read() {
            return Result::Err(
                "The deployed contract's bytecode root and expected contract bytecode root do not match",
            );
        }
 
        storage.registered_contracts.insert(child_contract, true);
        storage.registered_assets.insert(AssetId::new(child_contract, DEFAULT_SUB_ID), child_contract);

        Result::Ok(returned_root)
    }

    #[storage(read)]
    fn is_valid(child_contract: ContractId) -> bool {
        storage.registered_contracts.get(child_contract).try_read().unwrap_or(false)
    }

    #[storage(read)]
    fn factory_bytecode_root() -> Option<BytecodeRoot> {
        Some(storage.template_bytecode_root.read())
    }
}