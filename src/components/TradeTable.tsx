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
  Badge
} from "@/components/ui/badge";
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
export function TradeTable({ trades, tokenName }: Props) {
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
        {trades.map((trade) => (
          // TODO: change key
          <TableRow key={trade.id}>
            <TableCell className="font-medium">
              {getTruncatedAddress(trade.trador)}
            </TableCell>
            <TableCell><Badge className={trade.type === "BUY"? "bg-fuel-green":"bg-red-500"}>{trade.type}</Badge></TableCell>
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
        ))}
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
