import { launchTestNode } from 'fuels/test-utils';

import { describe, test, expect } from 'vitest';

/**
 * Imports for the contract factory and bytecode, so that we can use them in the test.
 *
 * Can't find these imports? Make sure you've run `fuels build` to generate these with typegen.
 */
import { BondingCurveFactory, MemeFactoryFactory } from '../src/sway-api';
import { createAssetId, getMintedAssetId, StructCoder } from 'fuels';
import { B256_ZERO, BASE_ASSET_ID } from '../src/lib';

StructCoder
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
          factory: BondingCurveFactory,
          options: {
            configurableConstants: {
              BASE_ASSET_ID: "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07"
            }
          }
        },
        {
          factory: MemeFactoryFactory,
        },
      ],
    });

    // We can now destructure the contract from the launched object.
    const {
      contracts: [contract, memefactory],
    } = launched;
    console.log("b256 address", contract.id.toString());
    const contractIdInput = {bits: contract.id.toB256()};

    const contractAssetId = createAssetId(contract.id.toHexString(), B256_ZERO); // getMintedAssetId
    const baseAssetId = contract.provider.getBaseAssetId();
    console.log({baseAssetId})
    // const baseAssetId = BASE_ASSET_ID;

    const getSupply = async () => {
      const {waitForResult: supplyWaitForResult} = await contract.functions.total_supply(contractAssetId).call();
      const {value: supply} = await supplyWaitForResult();
      return supply?.toBuffer("le", 8).readBigUint64LE();
    }

    const {value: optionalbytecoderoot} = await memefactory.functions.factory_bytecode_root().get();
    if (optionalbytecoderoot === B256_ZERO) {
      const {waitForResult: setBCRContractWait} = await memefactory.functions.set_bytecode_root(contractIdInput).call();
      const {value: newbcr} = await setBCRContractWait();
      console.log("newbcr", newbcr);
    }
    // await contract.functions.initialize("MyAsset", "TOKEN").call()
    const rc = await memefactory.functions.register_contract(contractIdInput, "MyAsset", "TOKEN").addContracts([contract]).fundWithRequiredCoins();
    console.log("maxFee", rc.maxFee.toBuffer("le", 8).readBigUInt64LE())
    console.log("gasLimit", rc.gasLimit.toBuffer("le", 8).readBigUInt64LE())
    const {waitForResult: registerContractWait} = await memefactory.functions.register_contract(contractIdInput, "MyAsset", "TOKEN").addContracts([contract]).call();
    const {value: bytecoderoot} = await registerContractWait();
    console.log("bytecoderoot", bytecoderoot.Ok);

    const {waitForResult: ethInWait} = await contract.functions.eth_in_by_token_out(700_000_000).call();
    const ethIn = await ethInWait();
    console.log("expected eth in: ", BigInt(ethIn.value.toBuffer("le", 8).readBigUint64LE()))
    // {bits: contract.id.toB256()}
    
    const {waitForResult: buyWait} = await memefactory.functions.buy_token(contractIdInput,700_000_000,1_000_000_000).addContracts([contract]).callParams({
      forward: {
        amount: 1_000_000_000,
        assetId: baseAssetId,
      }
    }).call();
    const {value: realEthIn} = await buyWait();
    console.log({realEthIn: realEthIn.toBuffer("le", 8).readBigUInt64LE()})
    // await contract.functions.buy_token(700_000_000,100_000_000).callParams({
    //   forward: {
    //     amount: 100_000_000,
    //     assetId: baseAssetId,
    //   }
    // }).call();
    expect((await getSupply())!).toBe(700000000n*1000000000n)

    await memefactory.functions.sell_token(contractIdInput,100_000_000,0).addContracts([contract]).callParams({
      forward: {
        amount: "100000000000000000",  // include decimals
        assetId: contractAssetId.bits,
      }
    }).call();
    expect((await getSupply())!).toBe(600000000n*1000000000n)
  });
});
