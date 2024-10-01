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

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
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
  const getTradeCount = (assetId: string) =>
    tradesData?.Trade.filter((trade) => trade.token === assetId).length;
  return (
    <div className="grid grid-cols md:grid-cols-2 xl:grid-cols-3 gap-4">
      {!!poolsData &&
        !!tradesData &&
        poolsData.Pool.map((pool) => (
          <Link
            className="no-underline hover:no-underline"
            href={`/${pool.asset}`}
          >
            <Card className="hover:no-underline flex items-center">
              <div className="py-2 px-4">
                <img
                  className="w-44 h-auto"
                  alt=""
                  src={pool.image}
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
  );
}
