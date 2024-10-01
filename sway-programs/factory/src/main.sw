contract;

use standards::src12::*;
use std::{
    call_frames::msg_asset_id,
    constants::DEFAULT_SUB_ID,
    context::msg_amount,
    external::bytecode_root,
    hash::{
        Hash,
        sha256,
    },
    storage::storage_vec::*,
    string::String,
    tx::tx_id,
};
use sway_libs::bytecode::*;
use libraries::BondingCurveAbi;

// events
struct PoolInitialized {
    pub tx_id: b256,
    pub contract_id: ContractId,
    pub asset_id: AssetId,
    pub name: String,
    pub symbol: String,
    pub dev: Identity,
    pub description: String,
    pub image: String,
    pub twitter: String,
    pub telegram: String,
    pub website: String,
}

struct TokenSold {
    pub trader: Identity,
    pub asset_id: AssetId,
    pub amount: u64,
    pub eth_out: u64,
}

struct TokenBought {
    pub trader: Identity,
    pub asset_id: AssetId,
    pub amount: u64,
    pub eth_in: u64,
}

enum MemeFactoryError {
    RegisteredToken: (),
    UnregisteredToken: (),
    InitializedFactory: (),
    UninitializedFactory: (),
    ZeroBytecodeRoot: (),
    InvalidBytecodeRoot: (),
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
    fn register_contract(
        child_contract: ContractId,
        name: String,
        symbol: String,
        description: String,
        image: String,
        twitter: String,
        telegram: String,
        website: String,
    ) -> Result<BytecodeRoot, str>;

    #[storage(read)]
    fn is_valid(child_contract: ContractId) -> bool;

    #[storage(read)]
    fn factory_bytecode_root() -> Option<BytecodeRoot>;
}

impl MemeFactoryAbi for Contract {
    #[storage(read, write), payable]
    fn buy_token(child_contract: ContractId, amount: u64, max_eth_in: u64) -> u64 {
        require(
            storage
                .registered_contracts
                .get(child_contract)
                .try_read()
                .unwrap_or(false),
            MemeFactoryError::UnregisteredToken,
        );
        let caller_contract = abi(BondingCurveAbi, child_contract.bits());
        let eth_in = caller_contract.buy_token {
            asset_id: msg_asset_id().bits(),
            coins: msg_amount(),
        }(msg_sender().unwrap(), amount, max_eth_in);
        log(TokenBought {
            trader: msg_sender().unwrap(),
            asset_id: AssetId::new(child_contract, DEFAULT_SUB_ID),
            amount: amount,
            eth_in: eth_in,
        });
        eth_in
    }

    #[storage(read, write), payable]
    fn sell_token(child_contract: ContractId, amount: u64, min_eth_out: u64) -> u64 {
        require(
            storage
                .registered_contracts
                .get(child_contract)
                .try_read()
                .unwrap_or(false),
            MemeFactoryError::UnregisteredToken,
        );
        let caller_contract = abi(BondingCurveAbi, child_contract.bits());
        let eth_out = caller_contract.sell_token {
            asset_id: msg_asset_id().bits(),
            coins: msg_amount(),
        }(msg_sender().unwrap(), amount, min_eth_out);
        log(TokenSold {
            trader: msg_sender().unwrap(),
            asset_id: AssetId::new(child_contract, DEFAULT_SUB_ID),
            amount: amount,
            eth_out: eth_out,
        });
        eth_out
    }

    #[storage(read, write)]
    fn set_bytecode_root(child_contract: ContractId) -> BytecodeRoot {
        require(
            storage
                .template_bytecode_root
                .read() == b256::zero(),
            MemeFactoryError::InitializedFactory,
        );
        let bytecode_root = bytecode_root(child_contract);
        require(
            bytecode_root != b256::zero(),
            MemeFactoryError::ZeroBytecodeRoot,
        );
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
        name: String,
        symbol: String,
        description: String,
        image: String,
        twitter: String,
        telegram: String,
        website: String,
    ) -> Result<BytecodeRoot, str> {
        require(
            storage
                .template_bytecode_root
                .read() != b256::zero(),
            MemeFactoryError::UninitializedFactory,
        );
        require(
            !storage
                .registered_contracts
                .get(child_contract)
                .try_read()
                .unwrap_or(false),
            MemeFactoryError::RegisteredToken,
        );
        let returned_root = bytecode_root(child_contract);
        // The deployed contract's bytecode root and expected contract bytecode root do not match
        require(
            returned_root == storage
                .template_bytecode_root
                .read(),
            MemeFactoryError::InvalidBytecodeRoot,
        );

        storage.registered_contracts.insert(child_contract, true);
        let asset_id = AssetId::new(child_contract, DEFAULT_SUB_ID);
        storage.registered_assets.insert(asset_id, child_contract);
        let caller_contract = abi(BondingCurveAbi, child_contract.bits());
        caller_contract.initialize(name, symbol, description, image, twitter, telegram, website);
        log(PoolInitialized {
            dev: msg_sender().unwrap(),
            tx_id: tx_id(),
            contract_id: child_contract,
            asset_id: asset_id,
            name: name,
            symbol: symbol,
            description: description,
            image: image,
            twitter: twitter,
            telegram: telegram,
            website: website,
        });

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
