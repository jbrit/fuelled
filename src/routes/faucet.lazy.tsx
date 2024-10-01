import { createLazyFileRoute } from "@tanstack/react-router";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useActiveWallet } from "../hooks/useActiveWallet";
import { useFaucet } from "../hooks/useFaucet";
import { bn } from "fuels";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  B256_ZERO,
  BASE_ASSET_CONTRACT_ID,
  CURRENT_ENVIRONMENT,
  Environments,
  TESTNET_FAUCET_LINK,
} from "../lib";
import { DummyAsset } from "../sway-api";

export const Route = createLazyFileRoute("/faucet")({
  component: Index,
});

function Index() {
  // Get the faucet wallet instance from the useFaucet hook
  const { faucetWallet } = useFaucet();

  const { wallet, refreshWalletBalance } = useActiveWallet();

  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [amountToSend, setAmountToSend] = useState<string>("5");

  useEffect(() => {
    if (wallet) {
      setReceiverAddress(wallet.address.toB256());
    }
  }, [wallet]);

  const sendFunds = async () => {
    if (!wallet) {
      return toast.error("Wallet not connected.");
    }

    if (!receiverAddress) {
      return toast.error("Receiver address not set");
    }

    if (!amountToSend) {
      return toast.error("Amount cannot be empty");
    }

    const dummyAsset = new DummyAsset(BASE_ASSET_CONTRACT_ID, wallet);
    await dummyAsset.functions
      .mint(
        { Address: { bits: receiverAddress } },
        B256_ZERO,
        parseInt(amountToSend) * 1e9
      )
      .call();

    // Transfer the specified amount of ETH to the receiver address
    const tx = await faucetWallet!.transfer(
      receiverAddress,
      bn.parseUnits(amountToSend.toString())
    );
    await tx.waitForResult();

    toast.success("Funds sent!");

    await refreshWalletBalance?.();
  };

  return (
    <>
      {CURRENT_ENVIRONMENT === Environments.TESTNET && (
        <div className="flex flex-col gap-5 items-stretch max-w-[400px] mx-auto">
          <h3 className="text-2xl font-semibold">Local Faucet</h3>

          <div className="flex gap-4 items-center">
            <label htmlFor="receiver-address-input" className="text-gray-400">
              Receiving address:
            </label>
            <Input
              className="w-full"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              placeholder="0x..."
              id="receiver-address-input"
            />
          </div>

          <div className="flex gap-4 items-center">
            <label htmlFor="amount-input" className="text-gray-400">
              Amount (FAKEETH):
            </label>
            <Input
              className="w-full"
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              placeholder="5"
              type="number"
              id="amount-input"
            />
          </div>

          <Button onClick={sendFunds}>Send Funds</Button>
        </div>
      )}

      {CURRENT_ENVIRONMENT === Environments.TESTNET + "k" && (
        <>
          <iframe
            src={
              wallet
                ? `${TESTNET_FAUCET_LINK}?address=${wallet.address.toB256()}`
                : TESTNET_FAUCET_LINK
            }
            title="faucet"
            className="w-full h-screen overflow-scroll"
          />
        </>
      )}
    </>
  );
}
