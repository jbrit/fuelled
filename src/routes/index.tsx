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
                  src="https://pump.mypinata.cloud/ipfs/QmaPyVx8Spow9sk3jQBy1ekVaBc9UAh9T6ngXfXRqiB6G7?img-width=128&img-dpr=2&img-onerror=redirect"
                  //unable to display image address placeholder
                  // src="data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%3Csvg%20width%3D%22128%22%20height%3D%22128%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%20%20%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22transparent%22%20stroke%3D%22%23666%22%20%2F%3E%0A%20%20%20%20%20%20%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20font-family%3D%22-apple-system%2C%20Inter%2C%20sans-serif%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666%22%20font-size%3D%2265%25%22%20font-size-adjust%3D%220.58%22%20%3E%0A%20%20%20%20%20%20%20%20Unable%20to%20display%20image%0A%20%20%20%20%20%20%3C%2Ftext%3E%0A%0A%20%20%20%20%3C%2Fsvg%3E%0A%0A"
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
                  A Deal of a Lifetime
                </CardFooter>
              </div>
            </Card>
          </Link>
        ))}
    </div>
  );
}
