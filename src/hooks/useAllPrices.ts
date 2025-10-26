import { useEffect, useState } from "react";
import { JsonRpcProvider, Contract } from "ethers";

import { getBranches } from "../config/cent";
import { getEnvOptional as getEnv } from "../lib/runtime-env";

const PriceFeedAbi = [
  { name: "lastGoodPrice", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

export type PriceData = {
  [collateralSymbol: string]: string | null; // Price in USD (formatted)
}

/**
 * Hook to fetch all collateral prices
 */
export function useAllPrices() {
  const [prices, setPrices] = useState<PriceData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const rpcUrl = getEnv("VITE_RPC_URL");
      if (!rpcUrl) return;

      const branches = getBranches();
      setLoading(true);

      try {
        const provider = new JsonRpcProvider(rpcUrl);

        const pricePromises = branches.map(async (branch) => {
          try {
            if (!branch.priceFeed) return { symbol: branch.collSymbol, price: null };

            const pf = new Contract(branch.priceFeed, PriceFeedAbi, provider);
            const raw: bigint = await pf.lastGoodPrice();
            const price = (Number(raw) / 1e18).toFixed(2);

            return { symbol: branch.collSymbol, price };
          } catch (e) {
            console.error(`Failed to fetch price for ${branch.collSymbol}:`, e);
            return { symbol: branch.collSymbol, price: null };
          }
        });

        const results = await Promise.all(pricePromises);

        const priceMap: PriceData = {};
        results.forEach(r => {
          priceMap[r.symbol] = r.price;
        });

        setPrices(priceMap);
      } catch (e) {
        console.error("Failed to load prices:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { prices, loading };
}
