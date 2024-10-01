library;

const MAX_TOKEN_SUPPLY: u64 = 1_000_000_000; 
pub const BONDING_CURVE_SUPPLY: u64 = 700_000_000;
// const BONDING_CURVE_CUBE: u256 = 700_000_000 * 700_000_000 * 700_000_000;  // 343_00_000_000_00_000_000_00_000_000;
const ETH_LIQUIDITY: u256 = 1_000_000_000;  // 1 ETH
const BONDING_CURVE_CUBE_PER_LIQUDITY = 343_000_000_000_000_000;

pub fn cube_root(num: u256) -> u64 {
    let mut curr_x = num / 0x0000000000000000000000000000000000000000000000000000000000000003u256;

    while true {
        let prev_x = curr_x;
        let fx = curr_x * curr_x * curr_x - num;
        let f_prime_x = 0x0000000000000000000000000000000000000000000000000000000000000003u256 * curr_x * curr_x;
        curr_x = prev_x - fx / f_prime_x;

        if curr_x == prev_x {
            break;
        }
    }

    <u64 as TryFrom<u256>>::try_from(curr_x).unwrap()
}

/// buy token
pub fn token_out_by_eth_in(total_supply: u64, eth_in: u64) -> u64 {
    let new_total_supply = cube_root(total_supply.as_u256().pow(3) + eth_in.as_u256() * BONDING_CURVE_CUBE_PER_LIQUDITY.as_u256());
    new_total_supply - total_supply
}

pub fn eth_in_by_token_out(total_supply: u64, token_out: u64) -> u64 {
    let new_total_supply = total_supply + token_out;
    let supply_difference = new_total_supply.as_u256().pow(3) - total_supply.as_u256().pow(3);
    // ceiling
    let difference_per_liquidity_cube = (supply_difference - 0x0000000000000000000000000000000000000000000000000000000000000001u256) / BONDING_CURVE_CUBE_PER_LIQUDITY.as_u256() + 0x0000000000000000000000000000000000000000000000000000000000000001u256;
    let eth_in =  <u64 as TryFrom<u256>>::try_from(difference_per_liquidity_cube).unwrap();
    eth_in
}

/// sell token
pub fn eth_out_by_token_in(total_supply: u64, token_in: u64) -> u64 {
    let new_total_supply = total_supply - token_in;
    <u64 as TryFrom<u256>>::try_from((total_supply.as_u256().pow(3) - new_total_supply.as_u256().pow(3)) / BONDING_CURVE_CUBE_PER_LIQUDITY.as_u256()).unwrap()
}