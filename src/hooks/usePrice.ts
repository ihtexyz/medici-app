import { useEffect, useState } from "react";
import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";

import { CENT_ADDRESSES, getBranchBySymbol } from "../config/cent";
import { getEnvOptional as getEnv } from "../lib/runtime-env";

const PriceFeedAbi = [
  { name: "lastGoodPrice", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

export function usePrice(collateralSymbol: string) {
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const rpcUrl = getEnv("VITE_RPC_URL");
    const provider = rpcUrl ? new JsonRpcProvider(rpcUrl) : undefined;
    const load = async () => {
      if (!provider || !CENT_ADDRESSES) return;
      const branch = getBranchBySymbol(collateralSymbol);
      if (!branch || !branch.priceFeed) return;
      setLoading(true);
      setError(null);
      try {
        const pf = new Contract(branch.priceFeed, PriceFeedAbi, provider);
        const raw: bigint = await pf.lastGoodPrice();
        if (cancelled) return;
        setPrice((Number(raw) / 1e18).toFixed(2));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load price");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [collateralSymbol]);

  return { price, loading, error };
}



