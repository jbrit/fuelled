import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getTruncatedAddress } from "@/lib/utils";
import moment from "moment";
import { Link } from "./Link";

type Props = {
  tokenName: string;
  trades: {
    id: string;
    trador: string;
    type: string;
    ethAmount: string;
    tokenAmount: string;
    createdAt: number;
    txId: string;
  }[];
};

function formatNumber(number: number): string {
  if (number >= 1000000000000) {
    return (number / 1000000000000).toFixed(0) + "T";
  } else if (number >= 1000000000) {
    return (number / 1000000000).toFixed(0) + "B";
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(0) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(0) + "K";
  } else if (number >= 100) {
    return "100";
  } else {
    return number.toString();
  }
}

export function TradeTable({ trades, tokenName }: Props) {
  const traderTxn = (trader: string) => {
    const selectedTrade = trades.filter((trade) => trade.trador === trader);
    const bought = selectedTrade.filter((trade) => trade.type === "BUY");
    const amountBoughtInETH = bought.reduce(
      (acc, trade) => acc + parseFloat(trade.ethAmount),
      0
    );
    const amountBoughtInToken = bought.reduce(
      (acc, trade) => acc + parseFloat(trade.tokenAmount.replace(/,/g, "")),
      0
    );
    const sold = selectedTrade.filter((trade) => trade.type === "SELL");
    const amountSoldInETH = sold.reduce(
      (acc, trade) => acc + parseFloat(trade.ethAmount),
      0
    );
    const amountSoldInToken = sold.reduce(
      (acc, trade) => acc + parseFloat(trade.tokenAmount.replace(/,/g, "")),
      0
    );
    const pnlInETH = amountBoughtInETH - amountSoldInETH;
    const pnlInToken = amountBoughtInToken - amountSoldInToken;
    const txn = {
      amountBoughtInETH: `${amountBoughtInETH?.toFixed(8)}ETH`,
      amountBoughtInToken: `${tokenName} ${formatNumber(amountBoughtInToken)} `,
      amountSoldInToken: `${tokenName} ${formatNumber(amountSoldInToken)} `,
      amountSoldInETH: `${amountSoldInETH?.toFixed(8)}ETH`,
      pnlInETH: `${pnlInETH?.toFixed(8)}ETH`,
      pnlInToken: `${tokenName} ${formatNumber(pnlInToken)}`,
      lengthOfBought: bought.length,
      lengthOfSold: sold.length,
    };
    return txn;
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">trador</TableHead>
          <TableHead>type</TableHead>
          <TableHead>$ETH</TableHead>
          <TableHead>${tokenName}</TableHead>
          <TableHead>time</TableHead>
          <TableHead className="text-right">transaction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((trade) => {
          const {
            amountBoughtInETH,
            amountBoughtInToken,
            amountSoldInToken,
            amountSoldInETH,
            lengthOfBought,
            lengthOfSold,
            pnlInETH,
            pnlInToken,
          } = traderTxn(trade.trador);
          return (
            // TODO: change key
            <TableRow key={trade.id}>
              <TableCell className="font-medium">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {getTruncatedAddress(trade.trador)}
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-slate-950 text-white rounded-none p-2 min-w-[300px]"
                      side="top"
                    >
                      <div className="bg-black text-white p-4 rounded-lg min-w-80 shadow-lg">
                        <div className="flex gap-4 justify-between text-sm mb-2">
                          <div className="flex flex-col">
                            <span className="text-gray-400">(-) Bought:</span>
                            <span className="text-gray-400">(+)</span>
                            <span className="text-gray-400">(=) PNL:</span>
                            {/* <span className="text-gray-400">Unrealized:</span> */}
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-red-500">
                              {amountBoughtInETH}
                            </span>
                            <span className="text-green-500">
                              {amountSoldInETH}
                            </span>
                            <span className="text-red-500">{pnlInETH}</span>
                            {/* <span className="text-white">$186</span> */}
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-gray-400">
                              {amountBoughtInToken}
                            </span>
                            <span className="text-gray-400">
                              {amountSoldInToken}
                            </span>
                            <span className="text-gray-400">{pnlInToken}</span>
                            {/* <span className="text-gray-400">
                            135.1K of 135.1K
                          </span> */}
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-gray-400">
                              {lengthOfBought} txns
                            </span>
                            <span className="text-gray-400">
                              {lengthOfSold} txns
                            </span>
                          </div>
                        </div>

                        {/* <div className="w-full bg-gray-700 rounded-full h-1.5 mb-4">
                        <div className="bg-white h-1.5 rounded-full w-full"></div>
                      </div> */}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    trade.type === "BUY" ? "bg-fuel-green" : "bg-red-500"
                  }
                >
                  {trade.type}
                </Badge>
              </TableCell>
              <TableCell>{trade.ethAmount}</TableCell>
              <TableCell>{trade.tokenAmount}</TableCell>
              <TableCell>{moment(trade.createdAt * 1000).fromNow()}</TableCell>
              <TableCell className="text-right">
                <>
                  <Link
                    href={`https://app-testnet.fuel.network/tx/${trade.txId}`}
                    target="_blank"
                  >
                    {trade.txId}
                  </Link>
                </>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      {trades.length === 0 && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className=" text-center">
              No trades yet
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}
