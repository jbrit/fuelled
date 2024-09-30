import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { MemeFactory } from "../sway-api";
import { NODE_URL, TESTNET_MEME_FACTORY_CONTRACT_ID } from "../lib";
import { Provider, toBech32 } from "fuels";
import { useQuery } from "@apollo/client";
import { ALL_POOLS_QUERY, ALL_TRADES_QUERY } from "../queries";
import moment from "moment";
import { TradeTab } from "../components/TradeTab";
import { getTruncatedAddress } from "@/lib/utils";
import { TradeTable } from "../components/TradeTable";

const memeFactoryContractId = TESTNET_MEME_FACTORY_CONTRACT_ID;

export const Route = createFileRoute("/$assetid")({
  component: () => {
    const { contract, assetid } = useLoaderData({ from: "/$assetid" });

    const {
      data: poolsData,
      loading: poolsLoading,
      error: poolsError,
    } = useQuery(ALL_POOLS_QUERY);
    const {
      data: tradesData,
      loading: tradesLoading,
      error: tradesError,
    } = useQuery(ALL_TRADES_QUERY);

    const filteredPoolInfos = poolsData?.Pool.filter(
      (pool) => pool.asset === assetid
    );
    const poolInfo = filteredPoolInfos?.length ? filteredPoolInfos[0] : null;
    console.log({ contract, assetid });
    console.log(poolsData?.Pool.filter((pool) => pool.asset === assetid));
    return (
      <div>
        {!!poolInfo && !!tradesData && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-12">
              <span className="inline-block">
                {poolInfo.name} [symbol: {poolInfo.symbol}]
              </span>
              <span className="inline-block md:ml-auto">
                Created By: {getTruncatedAddress(poolInfo.createdBy)} about{" "}
                {moment(poolInfo.createdAt * 1000).fromNow()}
              </span>
            </div>
            <div className="mb-4">
              <TradeTab
                symbol={poolInfo.symbol}
                contract={contract}
                asset={assetid}
              />
            </div>
            <TradeTable
              tokenName={poolInfo.symbol}
              trades={tradesData.Trade.filter((t) => t.token === assetid).map((trade) => ({
                id: trade.id,
                trador: trade.trader,
                type: trade.tradeType,
                ethAmount: "" + (trade.ethAmount / 1e9).toFixed(3),
                tokenAmount: parseInt(trade.tokenAmount)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                createdAt: trade.createdAt,
                txId: trade.txId,
              }))}
            />
          </>
        )}
      </div>
    );
  },
  loader: async ({ params }) => {
    const memeFactory = new MemeFactory(
      memeFactoryContractId,
      await Provider.create(NODE_URL)
    );
    const { value: contract } = await memeFactory.functions
      .get_asset_contract({ bits: params.assetid })
      .get();
    // should not be B256_ZERO
    return { contract, ...params };
  },
});
