import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { BondingCurve, MemeFactory } from "../sway-api";
import {
  BONDING_CURVE_TOTAL_SUPPLY,
  NODE_URL,
  TESTNET_MEME_FACTORY_CONTRACT_ID,
} from "../lib";
import { Provider, bn } from "fuels";
import { useQuery as useGraphQuery } from "@apollo/client";
import { ALL_POOLS_QUERY, ALL_TRADES_QUERY } from "../queries";
import moment from "moment";
import { TradeTab } from "../components/TradeTab";
import { getTruncatedAddress } from "@/lib/utils";
import { TradeTable } from "../components/TradeTable";
import CandlestickChart from "../components/CandlestickChart";
import toast from "react-hot-toast";
import { useRef } from "react";
import { useActiveWallet } from "../hooks/useActiveWallet";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

const memeFactoryContractId = TESTNET_MEME_FACTORY_CONTRACT_ID;

export const Route = createFileRoute("/$assetid")({
  component: () => {
    const { contract, assetid } = useLoaderData({ from: "/$assetid" });
    const { wallet } = useActiveWallet();
    const curveContract = wallet && new BondingCurve(contract.bits, wallet);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const {
      data: poolsData,
      loading: poolsLoading,
      error: poolsError,
    } = useGraphQuery(ALL_POOLS_QUERY);
    const {
      data: tradesData,
      loading: tradesLoading,
      error: tradesError,
    } = useGraphQuery(ALL_TRADES_QUERY, { pollInterval: 500 });

    const filteredPoolInfos = poolsData?.Pool.filter(
      (pool) => pool.asset === assetid
    );
    const poolInfo = filteredPoolInfos?.length ? filteredPoolInfos[0] : null;

    const { data: totalSupply } = useQuery({
      queryKey: ["totalSupply", assetid],
      queryFn: async () =>
        (
          (await curveContract!.functions.total_supply({ bits: assetid }).get())
            .value ?? bn(0)
        )
          .div(bn(1e9))
          .toNumber(),
      refetchInterval: 1000,
      enabled: !!curveContract,
    });
    const tokensAvailable =
      totalSupply && BONDING_CURVE_TOTAL_SUPPLY - totalSupply;
    const ethInCurve = tradesData?.Trade.reduce(
      (acc, trade) =>
        trade.token !== assetid
          ? acc
          : trade.tradeType === "BUY"
            ? acc.add(bn(trade.ethAmount))
            : acc.sub(bn(trade.ethAmount)),
      bn(0)
    ).toNumber();
    const curvePercent =
      totalSupply &&
      Math.floor((100 * totalSupply) / BONDING_CURVE_TOTAL_SUPPLY);

    const getOhlc = (minutes: number) => tradesData?.Trade.filter(
      (trade) => trade.token === assetid
    ).reduce(
      (acc, trade) => {
        acc.totalSupply =
          trade.tradeType === "BUY"
            ? acc.totalSupply + parseInt(trade.tokenAmount)
            : acc.totalSupply - parseInt(trade.tokenAmount);
        const minute = 60 * minutes * Math.floor(trade.createdAt / (60 * minutes));
        let price = 3 * acc.totalSupply**2 / (343 * 1e24);
        const inversePrice = 343*1e24/(3 * acc.totalSupply**2);
        price = parseFloat((1/ inversePrice).toFixed(11));

        let currentDate = moment.unix(minute).toDate();
        if (acc.ohlc.length === 0){
          acc.ohlc.push({
            x: currentDate,
            y: [price, price, price, price]
          })
        } else {
          let lastOhlc = acc.ohlc[acc.ohlc.length-1];
          if (currentDate.getTime() === lastOhlc.x.getTime()) {
            if ( price > lastOhlc.y[1]) {  // high
              lastOhlc.y[1] = price;
            } else if ( price < lastOhlc.y[2]) {  // low
              lastOhlc.y[2] = price;
            }
            lastOhlc.y[3] = price;  // close
          } else {
            acc.ohlc.push({
              x: currentDate,
              y: [lastOhlc.y[3], Math.max(lastOhlc.y[3], price), Math.min(lastOhlc.y[3],price), price]
            })
            // let newDate = lastOhlc.x;
            // // increase until current date...
            // while (newDate.getTime() < currentDate.getTime()){
            //   newDate = new Date(newDate.getTime() + 60_000 * minutes);  // old date + 1 minute
            //   // create the next entry, until trade is used

            //   lastOhlc = {
            //     x: newDate,
            //     y : newDate.getTime() ===  currentDate.getTime() ? [lastOhlc.y[3], Math.max(price, lastOhlc.y[3]), Math.min(price, lastOhlc.y[3]), price] : [lastOhlc.y[3], lastOhlc.y[3], lastOhlc.y[3], lastOhlc.y[3]]
            //   }
            //   acc.ohlc.push(lastOhlc)
            // }
          }
        }


        return acc;
      },
      {
        totalSupply: 0,
        ohlc: [] as { x: Date; y: [number, number, number, number] }[],
      }
    ).ohlc;
    return (
      <div>
        {!!poolInfo && !!tradesData && (
          <>
            {curvePercent === 100 ? (
              <p className="px-4 py-2 bg-green-400 text-slate-900 rounded-sm mb-4 w-fit text-base font-medium">
                Bonding curve filled, DEX launch pending
              </p>
            ) : null}
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
                  <CandlestickChart getOhlc={getOhlc} />
                </div>
              </div>
              <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <TradeTab
                  symbol={poolInfo.symbol}
                  contract={contract}
                  asset={assetid}
                  poolImg={poolInfo.image}
                  isBondingCuveFull={curvePercent === 100}
                />
                <div className="flex flex-col gap-2">
                  <p className="text-gray-500">
                    bonding curve progress: {curvePercent}%
                  </p>
                  <Progress value={curvePercent} />
                </div>
                <p className="text-gray-500">
                  when the bonding curve liquidity reaches 1 ETH, 300M $
                  {poolInfo.symbol} will be deposited into the DEX
                </p>
                <p className="text-gray-500">
                  there are {tokensAvailable?.toLocaleString()} tokens still
                  available for sale in the bonding curve and there is{" "}
                  {ethInCurve && ethInCurve / 1e9} ETH in the bonding curve.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {poolInfo.twitter && (
                    <a
                      href={poolInfo.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fuel-green hover:underline transition-all"
                    >
                      [Twitter]
                    </a>
                  )}
                  {poolInfo.website && (
                    <a
                      href={poolInfo.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fuel-green hover:underline transition-all"
                    >
                      [Website]
                    </a>
                  )}
                  {poolInfo.telegram && (
                    <a
                      href={poolInfo.telegram}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fuel-green hover:underline transition-all"
                    >
                      [Telegram]
                    </a>
                  )}
                </div>
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
              ).toReversed()}
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
