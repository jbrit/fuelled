import { createFileRoute } from "@tanstack/react-router";
import { Link } from "../components/Link";
import { ALL_POOLS_QUERY, ALL_TRADES_QUERY } from "../queries";
import { useQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import moment from "moment";
import { getTruncatedAddress } from "@/lib/utils";
import { Input } from "../components/Input";
import { useState } from "react";
import { Button } from "../components/Button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [search, setSearch] = useState<string>("");

  const {
    data: poolsData,
    loading: poolsLoading,
    error: poolsError,
  } = useQuery(ALL_POOLS_QUERY, { pollInterval: 1000 });

  const {
    data: tradesData,
    loading: tradesLoading,
    error: tradesError,
  } = useQuery(ALL_TRADES_QUERY, { pollInterval: 1000 });
  const getTradeCount = (assetId: string) =>
    tradesData?.Trade.filter((trade) => trade.token === assetId).length;
  return (
    <div>
      <div className="mb-10 mx-auto">
        <h1
          className="relative max-w-[300px] skew-x-6 bg-black px-10 py-1 mb-10 border-4 border-fuel-green bg-gradient-2 stroke stroke-transparent-text bg-clip-text text-black font-bold text-4xl text-center mx-auto stroke-effect 
    shadow-[-10px_-10px_0px_#4ade80] animate-skew"
        >
          NEW <br /> DROP
        </h1>

        {!!poolsData && poolsData.Pool.length && (
          <div className="flex justify-center items-center gap-4">
            <img
              className="w-20 h-20 object-cover"
              alt=""
              src={poolsData.Pool[poolsData.Pool.length - 1].image ?? ""}
            />
            <div className="flex flex-col gap-1">
              <p className="text-base font-bold text-white uppercase">
                {poolsData.Pool[poolsData.Pool.length - 1].name}
              </p>
              <p className="text-sm font-medium text-white">
                <span>Ticker : </span>
                <span className="text-fuel-green">
                  ${poolsData.Pool[poolsData.Pool.length - 1].symbol}
                </span>
              </p>
              <p className="text-sm font-medium text-white">
                <span>Trades : </span>
                <span className="text-fuel-green">
                  {getTradeCount(
                    poolsData.Pool[poolsData.Pool.length - 1].asset
                  )}
                </span>
              </p>
              <p className="text-sm font-medium text-white">
                <span>Fuelled by : </span>
                <span className="text-fuel-green">
                  {getTruncatedAddress(
                    poolsData.Pool[poolsData.Pool.length - 1].createdBy
                  )}{" "}
                  [{" "}
                  {moment(
                    poolsData.Pool[poolsData.Pool.length - 1].createdAt * 1000
                  ).fromNow()}{" "}
                  ]
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="mx-auto flex justify-center items-center gap-2 mb-10">
        <div className="max-w-[400px] w-[70%]">
          <Input
            className="w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for token"
          />
        </div>
        <Button
        // disabled={loading}
        // loading={loading}
        // onClick={onFinishLaunchPress}
        >
          Search
        </Button>
      </div>
      <div className="grid grid-cols md:grid-cols-2 xl:grid-cols-3 gap-4 place-items-stretch">
        {!!poolsData &&
          !!tradesData &&
          poolsData.Pool.map((pool) => (
            <Link
              className="no-underline hover:no-underline"
              href={`/${pool.asset}`}
            >
              <Card className="hover:no-underline flex flex-col md:flex-row items-stretch md:items-center h-full">
                <div className="py-2 px-4">
                  <img
                    className="w-full md:w-44 h-auto object-cover"
                    alt=""
                    src={pool.image ?? ""}
                  />
                </div>
                <div>
                  <CardHeader>
                    {pool.name} [symbol: ${pool.symbol}]
                    <CardDescription>
                      {getTradeCount(pool.asset)!} trades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    fuelled by {getTruncatedAddress(pool.createdBy)} [
                    {moment(pool.createdAt * 1000).fromNow()}]
                  </CardContent>
                  <CardFooter className="text-gray-400 text-sm">
                    {pool.description}
                  </CardFooter>
                </div>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
