import { FC, useState } from "react";
import { Link } from "./Link";
import { CURRENT_ENVIRONMENT, NODE_URL, TESTNET_FAUCET_LINK } from "../lib";
import { useConnectUI, useDisconnect } from "@fuels/react";
import { useBrowserWallet } from "../hooks/useBrowserWallet";
import { useActiveWallet } from "../hooks/useActiveWallet";
import { Button } from "./Button";
import { WalletDisplay } from "./WalletDisplay";
import { bn } from "fuels";
import { useFaucet } from "../hooks/useFaucet";
import toast from "react-hot-toast";
import { Logo } from "./Logo";

export const Navbar: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { faucetWallet } = useFaucet();

  const {
    wallet: browserWallet,
    isConnected: isBrowserWalletConnected,
    network: browserWalletNetwork,
  } = useBrowserWallet();

  const { connect } = useConnectUI();
  const { disconnect } = useDisconnect();

  const { wallet, refreshWalletBalance, walletBalance } = useActiveWallet();
  const topUpWallet = async () => {
    if (!wallet) {
      return console.error("Unable to topup wallet because wallet is not set.");
    }

    /**
     * If the current environment is local, transfer 5 ETH to the wallet
     * from the local faucet wallet
     */
    if (CURRENT_ENVIRONMENT === "local") {
      if (!faucetWallet) {
        return toast.error("Faucet wallet not found.");
      }

      const tx = await faucetWallet?.transfer(
        wallet.address,
        bn.parseUnits("5")
      );
      await tx?.waitForResult();

      toast.success("Wallet topped up!");

      return await refreshWalletBalance?.();
    }

    // If the current environment is testnet, open the testnet faucet link in a new tab
    if (CURRENT_ENVIRONMENT === "testnet") {
      return window.open(
        `${TESTNET_FAUCET_LINK}?address=${wallet.address.toAddress()}`,
        "_blank"
      );
    }
  };

  const showTopUpButton =
    false && isBrowserWalletConnected && walletBalance?.lt(bn.parseUnits("5"));

  const showAddNetworkButton =
    browserWallet &&
    browserWalletNetwork &&
    browserWalletNetwork?.url !== NODE_URL;

  const tryToAddNetwork = () => {
    return alert(
      `Please add the network ${NODE_URL} to your Fuel wallet, or swtich to it if you have it already, and refresh the page.`
    );
  };

  return (
    <>
      {/* Larger screens */}
      <nav className="hidden md:flex justify-between items-center p-4 bg-black text-white gap-6">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex justify-between items-center gap-6">
          <Link href="/launch">launch</Link>
          <Link href="/faucet">faucet</Link>

          {isBrowserWalletConnected && (
            <Button onClick={disconnect}>Disconnect Wallet</Button>
          )}
          {!isBrowserWalletConnected && (
            <Button onClick={connect}>Connect Wallet</Button>
          )}

          {showAddNetworkButton && (
            <Button onClick={tryToAddNetwork} className="bg-red-500">
              Wrong Network
            </Button>
          )}

          <div className="ml-auto">
            {isBrowserWalletConnected && <WalletDisplay />}
          </div>

          {showTopUpButton && (
            <Button onClick={() => topUpWallet()}>Top-up Wallet</Button>
          )}
        </div>
      </nav>

      {/* Mobile. Should be a hamburger menu */}
      <nav className="flex flex-col md:hidden p-4 bg-black text-white items-center gap-4">
        <div className="w-full flex justify-between items-center gap-2">
          <Link href="/">
            <Logo />
          </Link>
          <img
            src={isMobileMenuOpen ? "/close.svg" : "/hamburger.svg"}
            alt="menu"
            className="w-8 h-8 ml-auto cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>

        {isMobileMenuOpen && (
          <>
            {/* <Link href="/">
              <Logo />
            </Link> */}

            <Link href="/launch">launch</Link>
            <Link href="/faucet">faucet</Link>

            {isBrowserWalletConnected && (
              <Button onClick={disconnect}>Disconnect Wallet</Button>
            )}
            {!isBrowserWalletConnected && (
              <Button onClick={connect}>Connect Wallet</Button>
            )}

            {showAddNetworkButton && (
              <Button onClick={() => toast.success("Adding network")}>
                Add Network
              </Button>
            )}

            {isBrowserWalletConnected && (
              <div>
                <WalletDisplay />
              </div>
            )}

            {showTopUpButton && (
              <Button onClick={() => topUpWallet()}>Top-up Wallet</Button>
            )}
          </>
        )}
      </nav>
    </>
  );
};
