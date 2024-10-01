import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  poolImg: string;
};

export function TradeTab({ symbol, contract, asset, poolImg }: Props) {
  const [currency, setCurrency] = useState("ETH");
  const [showSlippage, setShowSlippage] = useState(false);
  const [slippage, setSlippage] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);
  const [ethIn, setEthIn] = useState(0);
  const [ethOut, setEthOut] = useState(0);
  const { wallet, walletBalance, refreshWalletBalance } = useActiveWallet();
  const memeFactorycontract =
    wallet && new MemeFactory(TESTNET_MEME_FACTORY_CONTRACT_ID, wallet);
  const curveContract = wallet && new BondingCurve(contract.bits, wallet);
  return (
    <>
      <Dialog open={showSlippage} onOpenChange={setShowSlippage}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-gray-300">
              Set max. slippage (%)
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This is the maximum amount of slippage you are willing to accept
              when placing trades
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              value={slippage}
              onChange={(e) => setSlippage(parseInt(e.target.value))}
              type="number"
              className="text-white"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setSlippage(0);
                setShowSlippage(false);
              }}
              type="submit"
            >
              [close]
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
        </TabsList>
        <TabsContent value="buy">
          <Card>
            <CardHeader>
              <CardTitle>
                Buy {currency !== "ETH" ? `$${symbol}` : "ETH"}
              </CardTitle>
              {/* <CardDescription>...</CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setCurrency((prev) => (prev === "ETH" ? symbol : "ETH"));
                    }}
                    className="bg-slate-600 px-2 py-1 text-xs font-medium bg-opacity-70 hover:bg-opacity-100 transition-all text-white rounded-sm"
                  >
                    switch to {currency === "ETH" ? `$${symbol}` : "ETH"}
                  </button>
                  <button
                    onClick={() => {
                      setShowSlippage(true);
                    }}
                    className="bg-fuel-green px-2 py-1 text-xs font-medium bg-opacity-50 hover:bg-opacity-100 transition-all text-white rounded-sm"
                  >
                    Set max slippage
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="buyAmount"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(parseInt(e.target.value))}
                    type="number"
                    className="appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-200 text-lg font-bold flex items-center gap-3">
                    {currency !== "ETH" ? `$${symbol}` : <span>ETH</span>}
                    <img
                      src={
                        currency === "ETH"
                          ? "https://png.pngtree.com/png-vector/20210522/ourmid/pngtree-vector-illustration-of-crytocurrency-ethereum-png-image_3314668.jpg"
                          : poolImg
                      }
                      width={20}
                      height={20}
                    />
                  </span>
                </div>
                {currency === "ETH" ? (
                  <div className="flex items-center gap-2">
                    {[0, 1, 5, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setBuyAmount(n);
                        }}
                        className="bg-fuel-green px-2 py-1 text-xs font-medium bg-opacity-50 hover:bg-opacity-100 transition-all text-white rounded-sm"
                      >
                        {n ? `${n} ETH` : "reset"}
                      </button>
                    ))}
                  </div>
                ) : null}
                <p className="text-base text-gray-500">28331683 ETH</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={async () => {
                  if (!wallet || !memeFactorycontract)
                    return toast.error("Wallet not connected");
                  const { value: validContract } =
                    await memeFactorycontract.functions
                      .is_valid(contract)
                      .get();
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
              {/* <CardDescription>...</CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowSlippage(true);
                  }}
                  className="bg-red-600 px-2 py-1 text-xs font-medium bg-opacity-70 hover:bg-opacity-100 transition-all text-white rounded-sm"
                >
                  Set max slippage
                </button>

                <div className="relative">
                  <Input
                    id="sellAmount"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(parseInt(e.target.value))}
                    type="number"
                  />

                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-200 text-lg font-bold flex gap-3 items-center">
                    ${symbol}
                    <img src={poolImg} width={20} height={20} />
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 25, 50, 75, 100].map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setSellAmount((prev) => (n / 100) * prev);
                      }}
                      className="bg-red-600 px-2 py-1 text-xs font-medium bg-opacity-70 hover:bg-opacity-100 transition-all text-white rounded-sm"
                    >
                      {n ? `${n}%` : "reset"}
                    </button>
                  ))}
                </div>
                <p className="text-base text-gray-500">28331683 ETH</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={async () => {
                  if (!wallet || !memeFactorycontract)
                    return toast.error("Wallet not connected");
                  const { value: validContract } =
                    await memeFactorycontract.functions
                      .is_valid(contract)
                      .get();
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
    </>
  );
}
