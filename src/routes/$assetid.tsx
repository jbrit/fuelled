import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { MemeFactory } from '../sway-api'
import contractIds from "../sway-api/contract-ids.json";
import { B256_ZERO, CURRENT_ENVIRONMENT, Environments, NODE_URL, TESTNET_MEME_FACTORY_CONTRACT_ID } from '../lib';
import { Provider } from 'fuels';

const memeFactoryContractId =
  CURRENT_ENVIRONMENT === Environments.LOCAL
    ? contractIds.memeFactory
    : TESTNET_MEME_FACTORY_CONTRACT_ID;

export const Route = createFileRoute('/$assetid')({
  component: (props) => {
    const {contract, assetid} = useLoaderData({from: "/$assetid"});
    console.log(props)
  return <div>
    Deployed Contract: {contract.value.bits} <br />
    Asset Id: {assetid}
  </div>
},
  loader: async ({params}) => {
    const memeFactory = new MemeFactory(memeFactoryContractId,  await Provider.create(NODE_URL));
    const contract = await memeFactory.functions.get_asset_contract({bits: params.assetid}).get();
    console.log(contract.value.bits)
    // should not be B256_ZERO
    return {contract, ...params}
  },

})