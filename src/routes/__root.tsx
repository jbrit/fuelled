/* eslint-disable react-hooks/rules-of-hooks */
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Layout } from "../components/Layout";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FuelProvider } from "@fuels/react";
import { defaultConnectors } from "@fuels/connectors";
import { ActiveWalletProvider } from "../hooks/useActiveWallet";


const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Only render the component if the page has been mounted.
    if (!isMounted) return null;

    return (
      <>
        <QueryClientProvider client={queryClient}>
          <FuelProvider
            fuelConfig={{
              connectors: defaultConnectors(),
            }}
          >
            <ActiveWalletProvider>
              <Layout>
                <Outlet />
              </Layout>
            </ActiveWalletProvider>
          </FuelProvider>
        </QueryClientProvider>
      </>
    );
  },
});
