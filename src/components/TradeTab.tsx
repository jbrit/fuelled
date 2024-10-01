import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useActiveWallet } from "../hooks/useActiveWallet";
import { BondingCurve, MemeFactory } from "../sway-api";
import { BASE_ASSET_ID, TESTNET_MEME_FACTORY_CONTRACT_ID } from "../lib";
import toast from "react-hot-toast";

type Props = {
  symbol: string;
  contract: { bits: string };
  asset: string;
};

export function TradeTab({ symbol, contract, asset }: Props) {
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);
  const [ethIn, setEthIn] = useState(0);
  const [ethOut, setEthOut] = useState(0);
  const { wallet, walletBalance, refreshWalletBalance } = useActiveWallet();
  const memeFactorycontract =
    wallet && new MemeFactory(TESTNET_MEME_FACTORY_CONTRACT_ID, wallet);
  const curveContract = wallet && new BondingCurve(contract.bits, wallet);
  return (
    <Tabs defaultValue="buy" className="w-full max-w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="buy">Buy</TabsTrigger>
        <TabsTrigger value="sell">Sell</TabsTrigger>
      </TabsList>
      <TabsContent value="buy">
        <Card>
          <CardHeader>
            <CardTitle>Buy ${symbol}</CardTitle>
            <CardDescription>...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Input
                id="buyAmount"
                value={buyAmount}
                onChange={(e) => setBuyAmount(parseInt(e.target.value))}
                type="number"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={async () => {
                if (!wallet || !memeFactorycontract)
                  return toast.error("Wallet not connected");
                const { value: validContract } =
                  await memeFactorycontract.functions.is_valid(contract).get();
                console.log({ validContract, contract });
                const { waitForResult: buyWait } =
                  await memeFactorycontract.functions
                    .buy_token(contract, buyAmount, 1e9)
                    .callParams({
                      forward: {
                        assetId: BASE_ASSET_ID,
                        amount: 1e9,
                      },
                    })
                    .addContracts([curveContract!])
                    .call();
                const { value } = await buyWait();
                toast.success(
                  `Bought ${buyAmount} ${symbol} for ${value.toNumber() / 1e9} ETH`
                );
              }}
              className="bg-fuel-green w-full"
            >
              Buy Token
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="sell">
        <Card>
          <CardHeader>
            <CardTitle>Sell ${symbol}</CardTitle>
            <CardDescription>...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Input
                id="sellAmount"
                value={sellAmount}
                onChange={(e) => setSellAmount(parseInt(e.target.value))}
                type="number"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={async () => {
                if (!wallet || !memeFactorycontract)
                  return toast.error("Wallet not connected");
                const { value: validContract } =
                  await memeFactorycontract.functions.is_valid(contract).get();
                console.log({ validContract, contract, sellAmount });
                const { waitForResult: sellWait } =
                  await memeFactorycontract.functions
                    .sell_token(contract, sellAmount, 0)
                    .callParams({
                      forward: {
                        assetId: asset,
                        amount: `${sellAmount}000000000`,
                      },
                    })
                    .addContracts([curveContract!])
                    .call();
                const { value } = await sellWait();
                toast.success(`Sold ${symbol} for ${value} ETH`);
              }}
              className="bg-red-500 w-full"
            >
              Sell Token
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
