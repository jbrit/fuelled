import { createFileRoute } from "@tanstack/react-router";
import { BondingCurve, BondingCurveFactory, MemeFactory } from "../sway-api";
import {
  arrayify,
  createAssetId,
  hexlify,
  BytesLike,
  chunkAndPadBytes,
} from "fuels";
import { calcRoot } from "@fuel-ts/merkle";
import { useState } from "react";
import { Link } from "../components/Link";
import { Button } from "../components/Button";
import toast from "react-hot-toast";
import { B256_ZERO, TESTNET_MEME_FACTORY_CONTRACT_ID } from "../lib";
import { Input } from "../components/Input";
import { useActiveWallet } from "../hooks/useActiveWallet";

export const Route = createFileRoute("/launch")({
  component: Launch,
});

const memeFactoryContractId = TESTNET_MEME_FACTORY_CONTRACT_ID; // Testnet Contract ID

export const getContractRoot = (bytecode: BytesLike): string => {
  const chunkSize = 16 * 1024;
  const bytes = arrayify(bytecode);
  const chunks = chunkAndPadBytes(bytes, chunkSize);

  return calcRoot(chunks.map((c) => hexlify(c)));
};

function Launch() {
  const [newCurve, setNewCurve] = useState<BondingCurve>();
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [{description, image, twitter, telegram, website}, setCurveInfo] = useState({
    description: "chickenny chick",
    image: "https://pump.mypinata.cloud/ipfs/QmaPyVx8Spow9sk3jQBy1ekVaBc9UAh9T6ngXfXRqiB6G7?img-width=128&img-dpr=2&img-onerror=redirect",
    twitter: "",
    telegram: "",
    website: "",
  });
  const [assetId, setAssetId] = useState<string>();
  const { wallet } = useActiveWallet();
  const memeFactorycontract =
    wallet && new MemeFactory(memeFactoryContractId, wallet);

  const onLaunchPress = async () => {
    if (!!newCurve) {
      return toast.error("Launch already started");
    }

    if (!wallet) {
      return toast.error("Wallet not connected");
    }

    if (!name || !symbol) {
      return toast.error("Name and Symbol required");
    }

    if (!memeFactorycontract) {
      return toast.error("Contract not loaded");
    }

    const { waitForResult, contractId } = await BondingCurveFactory.deploy(
      wallet,
      { storageSlots: BondingCurve.storageSlots }
    );
    await waitForResult();
    const newBondingCurve = new BondingCurve(contractId, wallet);
    setNewCurve(newBondingCurve);
    try {
      await memeFactorycontract.functions
        .set_bytecode_root({ bits: contractId })
        .call();
      toast.success("bytecoderoot set");
    } catch (error) {
    }
  };

  const onFinishLaunchPress = async () => {
    if (!wallet) {
      return toast.error("Wallet not connected");
    }

    if (!newCurve || !memeFactorycontract) {
      return toast.error("Contract not loaded");
    }
    if (!name || !symbol) {
      return toast.error("Name and Symbol required");
    }
    try {
      const assetId = createAssetId(newCurve.id.toHexString(), B256_ZERO).bits;
      await memeFactorycontract.functions
        .register_contract({ bits: newCurve.id.toB256() }, name, symbol, description, image, twitter, telegram, website)
        .addContracts([newCurve])
        .call();
      setAssetId(assetId);
    } catch (error) {
      console.log(error);
      // @ts-ignore
      const message: string = error.message;
      if (message.includes('"RegisteredToken"')) {
        toast.error("Token Already Registered");
        setAssetId(assetId);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center">
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

      <Button onClick={onLaunchPress} className="mt-4">
        &gt;&gt; Launch &lt;&lt;
      </Button>

      {!!newCurve && (
        <>
          <div className="flex flex-col gap-2 items-center">
            <div>Asset deployed at</div>
            <div>
              {createAssetId(newCurve.id.toHexString(), B256_ZERO).bits}
            </div>
          </div>
          <Button onClick={onFinishLaunchPress} className="mt-6">
            &gt;&gt; Finalize Launch &lt;&lt;
          </Button>
        </>
      )}
      {!!assetId && (
        <>
          <Link href={`/${assetId}`}>View Asset</Link>
        </>
      )}
    </div>
  );
}
