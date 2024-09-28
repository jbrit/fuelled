import { createLazyFileRoute } from "@tanstack/react-router";
import { BondingCurve, BondingCurveFactory, MemeFactory } from "../sway-api";
import contractIds from "../sway-api/contract-ids.json";
import { bn, createAssetId, toB256 } from "fuels";
import { useState } from "react";
import { Link } from "../components/Link";
import { Button } from "../components/Button";
import toast from "react-hot-toast";
import { useActiveWallet } from "../hooks/useActiveWallet";
import useAsync from "react-use/lib/useAsync";
import {
  B256_ZERO,
  CURRENT_ENVIRONMENT,
  Environments,
  TESTNET_CONTRACT_ID,
  TESTNET_MEME_FACTORY_CONTRACT_ID,
} from "../lib";
import { Input } from "../components/Input";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

const memeFactoryContractId =
  CURRENT_ENVIRONMENT === Environments.LOCAL
    ? contractIds.memeFactory
    : TESTNET_MEME_FACTORY_CONTRACT_ID; // Testnet Contract ID

const bondingCurveContractId =
  CURRENT_ENVIRONMENT === Environments.LOCAL
    ? contractIds.bondingCurve
    : TESTNET_CONTRACT_ID; // Testnet Contract ID

console.log("TESTNET_CONTRACT_ID", TESTNET_CONTRACT_ID)
function Index() {
  const { wallet, walletBalance, refreshWalletBalance } = useActiveWallet();
  const [contract, setContract] = useState<MemeFactory>();
  const [bondingCurveFactory, setBondingCurveFactory] = useState<BondingCurveFactory>();
  const [newCurve, setNewCurve] = useState<BondingCurve>();
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [assetId, setAssetId] = useState<string>();

  useAsync(async () => {
    if (wallet) {
      const curveFactory = new BondingCurveFactory(wallet);
      setBondingCurveFactory(curveFactory);

      // Create a new instance of the contract
      const memeFactory = new MemeFactory(memeFactoryContractId, wallet);
      setContract(memeFactory);
    }
  }, [wallet]);

  const onLaunchPress = async () => {
    if (!!newCurve) {
      return toast.error("Launch already started");
    }

    if (!bondingCurveFactory || !contract) {
      return toast.error("Contract not loaded");
    }

    if (!wallet) {
      return toast.error("Wallet not connected");
    }

    const { waitForResult } = await bondingCurveFactory.deployAsCreateTx();
    const { contract: newBondingCurveContract } = await waitForResult();

    const newBondingCurve = new BondingCurve(bondingCurveContractId ?? newBondingCurveContract.id, wallet);
    setNewCurve(newBondingCurve);

    try {
      await contract.functions.set_bytecode_root({bits: bondingCurveContractId ?? newBondingCurveContract.id.toB256()}).call();
      toast.success("bytecoderoot set")
    } catch {
    }
  };

  const onFinishLaunchPress = async () => {
    if (!newCurve || !contract) {
      return toast.error("Contract not loaded");
    }
    const assetId = createAssetId(newCurve.id.toHexString(), B256_ZERO).bits;
    try {
      await contract.functions.register_contract({bits: bondingCurveContractId ?? newCurve.id.toB256()}, "TOKEN NAME", "SYMBOL").call();
      setAssetId(assetId);
    } catch (error) {
      // @ts-ignore
      const message: string = error.message;
      if (message.includes('"RegisteredToken"')) {
        toast.error("Token Already Registered");
        setAssetId(assetId);
      }
    }
    await refreshWalletBalance?.();
  }

  return (
    <div className="flex flex-col gap-2 items-center">
        {/* <div className="flex flex-col gap-2 items-center"> */}
          <h3 className="text-2xl font-semibold mb-2">Launch A Coin</h3>

          <div className="flex flex-col justify-center">
            <label htmlFor="token-name" className="text-gray-400">
              Name:
            </label>
            <Input
              className="w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ETHEREUM"
              id="token-name"
              readOnly={!!newCurve}
            />
          </div>

          <div className="flex flex-col justify-center">
            <label htmlFor="token-symbol" className="text-gray-400">
              Symbol:
            </label>
            <Input
              className="w-full"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="ETH"
              id="token-symbol"
              readOnly={!!newCurve}
            />
          </div>

        {/* </div> */}

        <Button onClick={onLaunchPress} className="mt-4">
         &gt;&gt; Launch &lt;&lt;
        </Button>

        {!!newCurve && <>
        <div className="flex flex-col gap-2 items-center">
          <div>
            Asset deployed at
          </div>
          <div>
            {createAssetId(newCurve.id.toHexString(), B256_ZERO).bits}
          </div>
        </div>
        <Button onClick={onFinishLaunchPress} className="mt-6">
         &gt;&gt; Finalize Launch &lt;&lt;
        </Button>
        </>}
        {!!assetId && <>
        <Link href={`/${assetId}`}>View Asset</Link>
        </>}

    </div>
  );
}
