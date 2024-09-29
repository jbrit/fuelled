import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { MemeFactory } from '../sway-api'
import contractIds from "../sway-api/contract-ids.json";
import { B256_ZERO, CURRENT_ENVIRONMENT, Environments, NODE_URL, TESTNET_MEME_FACTORY_CONTRACT_ID } from '../lib';
import { Provider, toBech32 } from 'fuels';
import { useQuery } from '@apollo/client';
import { ALL_POOLS_QUERY, ALL_TRADES_QUERY } from '../queries';
import moment from "moment";

const memeFactoryContractId =
  CURRENT_ENVIRONMENT === Environments.LOCAL
    ? contractIds.memeFactory
    : TESTNET_MEME_FACTORY_CONTRACT_ID;

export const Route = createFileRoute('/$assetid')({
  component: () => {
    const {contract, assetid} = useLoaderData({from: "/$assetid"});
    
    const {data: poolsData, loading: poolsLoading, error: poolsError} = useQuery(ALL_POOLS_QUERY);
    const {data: tradesData, loading: tradesLoading, error: tradesError} = useQuery(ALL_TRADES_QUERY);

    const filteredPoolInfos = poolsData?.Pool.filter(pool => pool.asset === assetid);
    const poolInfo = filteredPoolInfos?.length ? filteredPoolInfos[0] : null;
    
    console.log(poolsData?.Pool.filter(pool => pool.asset === assetid))
  return <div>
    Deployed Contract: {contract.value.bits} <br />
    Asset Id: {assetid} <br />
    {!!poolInfo && <>
    <div>Name: {poolInfo.name}</div>
    <div>Symbol: {poolInfo.symbol}</div>
    <div>Created By: {toBech32(poolInfo.createdBy)}</div>
    <div>Created: {moment(poolInfo.createdAt*1000).fromNow()}</div>
    <div>Created TX: {poolInfo.txId}</div>
    </>}
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