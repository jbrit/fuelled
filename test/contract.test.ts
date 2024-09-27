import { launchTestNode } from 'fuels/test-utils';

import { describe, test, expect } from 'vitest';

/**
 * Imports for the contract factory and bytecode, so that we can use them in the test.
 *
 * Can't find these imports? Make sure you've run `fuels build` to generate these with typegen.
 */
import { TestContractFactory } from '../src/sway-api';
import { createAssetId } from 'fuels';
const B256_ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000"

/**
 * Contract Testing
 * 
 *
 * Tests for the contract program type within the TS SDK. Here we will test the deployment of
 * our contract, and the result of call it's functions.
 */
describe('Contract', () => {
  test('Deploy and Call', async () => {
    // First, we'll launch a test node, passing the contract factory and bytecode. This will deploy the contract
    // to our test node so we can test against it.
    using launched = await launchTestNode({
      // The test node will be killed automatically once the `launched` variable goes out of scope,
      // because we are instantiating it with the `using` keyword.
      contractsConfigs: [
        {
          factory: TestContractFactory,
        },
      ],
    });

    // We can now destructure the contract from the launched object.
    const {
      contracts: [contract],
    } = launched;

    const contractAssetId = createAssetId(contract.id.toHexString(), B256_ZERO);
    const baseAssetId = contract.provider.getBaseAssetId();

    const getSupply = async () => {
      const {waitForResult: supplyWaitForResult} = await contract.functions.total_supply(contractAssetId).call();
      const {value: supply} = await supplyWaitForResult();
      return supply?.toBuffer("le", 8).readBigUint64LE();
    }


    const {waitForResult: ethInWait} = await contract.functions.eth_in_by_token_out(700_000_000).call();
    const ethIn = await ethInWait();
    console.log("expected eth in: ", BigInt(ethIn.value.toBuffer("le", 8).readBigUint64LE()))
    
    await contract.functions.buy_token(700_000_000,100_000_000).callParams({
      forward: {
        amount: 100_000_000,
        assetId: baseAssetId,
      }
    }).call();
    expect((await getSupply())!).toBe(700000000n)

    await contract.functions.sell_token(100_000_000,0).callParams({
      forward: {
        amount: "100000000000000000",  // include decimals
        assetId: contractAssetId.bits,
      }
    }).call();
    expect((await getSupply())!).toBe(600000000n)
  });
});
