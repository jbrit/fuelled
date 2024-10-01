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
import CandlestickChart from "../components/CandlestickChart";
import toast from "react-hot-toast";
import { useRef } from "react";

const memeFactoryContractId = TESTNET_MEME_FACTORY_CONTRACT_ID;

export const Route = createFileRoute("/$assetid")({
  component: () => {
    const { contract, assetid } = useLoaderData({ from: "/$assetid" });
    const buttonRef = useRef<HTMLButtonElement>(null);

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

    console.log(assetid, poolInfo);
    return (
      <div>
        {!!poolInfo && !!tradesData && (
          <>
            {/* <div className="flex flex-col md:flex-row gap-4 mb-12">
              <span className="inline-block">
                {poolInfo.name} [symbol: {poolInfo.symbol}]
              </span>
              <span className="inline-block md:ml-auto">
                Created By: {getTruncatedAddress(poolInfo.createdBy)} about{" "}
                {moment(poolInfo.createdAt * 1000).fromNow()}
              </span>
            </div> */}
            <div className="mb-4 md:mb-8 lg:mb-10 w-full flex flex-col lg:flex-row flex-nowrap gap-5 md:gap-10 xl:gap-20">
              <div className="w-full lg:w-2/3">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between gap-3 flex-wrap items-center">
                    <div className="flex flex-wrap gap-3 items-center">
                      <p className="text-sm text-gray-400 lowercase">
                        {poolInfo.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        Ticker: {poolInfo.symbol}
                      </p>
                      <p className="text-sm text-gray-400">Asset id:</p>
                      <p className="flex text-sm font-bold text-gray-400 items-center gap-1 border border-gray-400 h-7">
                        <span className="p-1">
                          {getTruncatedAddress(assetid)}
                        </span>
                        <span className="inline-block h-full bg-gray-400 w-[1px]">
                          {" "}
                        </span>
                        <button
                          ref={buttonRef}
                          className="cursor-pointer p-1"
                          onClick={() => {
                            navigator.clipboard.writeText(assetid);
                            const buttonCurrent = buttonRef?.current;
                            if (!buttonCurrent) return;
                            buttonCurrent.textContent = "copied";
                            setTimeout(() => {
                              buttonCurrent.textContent = "copy";
                            }, 1000);
                            // toast.success("Asset id copied to clipboard");
                          }}
                        >
                          copy
                        </button>
                      </p>
                    </div>
                    <p className="text-green-400">
                      created by{" "}
                      <span className="p-1 bg-fuel-green bg-opacity-20 text-gray-300">
                        {getTruncatedAddress(poolInfo.createdBy)}
                      </span>{" "}
                      about {moment(poolInfo.createdAt * 1000).fromNow()}
                    </p>
                  </div>
                  <CandlestickChart />
                </div>
              </div>
              <div className="w-full lg:w-1/3">
                <TradeTab
                  symbol={poolInfo.symbol}
                  contract={contract}
                  asset={assetid}
                  poolImg={poolInfo.image}
                />
              </div>
            </div>
            <h2 className="border-b-2 border-b-fuel-green text-white text-lg font-bold p-1 w-fit mb-6">
              Trades
            </h2>
            <TradeTable
              tokenName={poolInfo.symbol}
              trades={tradesData.Trade.filter((t) => t.token === assetid).map(
                (trade) => ({
                  id: trade.id,
                  trador: trade.trader,
                  type: trade.tradeType,
                  ethAmount: "" + (trade.ethAmount / 1e9).toFixed(9),
                  tokenAmount: parseInt(trade.tokenAmount)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                  createdAt: trade.createdAt,
                  txId: trade.txId,
                })
              )}
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
