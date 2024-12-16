import { config, blockchainData, orderbook } from "@imtbl/sdk";
import { createContext, useContext, useMemo } from "react";

const getOrderBook = () => {
  return new orderbook.Orderbook({
    baseConfig: {
      environment: config.Environment.SANDBOX,
    },
  });
}
const getBlockchainData = () => {
  return new blockchainData.BlockchainData({
    baseConfig: {
      environment: config.Environment.SANDBOX,
    },
  });
};

const ImmutableContext = createContext<{
  blockchainDataClient: blockchainData.BlockchainData;
} | null>(null);

export function ImmutableProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
  const providerValues = useMemo(() => {
    const blockchainDataClient = getBlockchainData();
    const orderbook = getOrderBook();
    return {
      blockchainDataClient,
      orderbook
    };
  }, []);

  return <ImmutableContext.Provider value={providerValues}>{children}</ImmutableContext.Provider>;
}

export function useImmutableProvider() {
  const ctx = useContext(ImmutableContext);
  if (!ctx) throw new Error("useImmutableProvider must be used within a ImmutableProvider");
  return ctx;
}
