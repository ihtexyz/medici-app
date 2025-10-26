import { useEffect, useState } from "react";
import { Contract, JsonRpcProvider } from "ethers";

import { getEnvOptional as getEnv } from "../lib/runtime-env";
import { getBranchBySymbol } from "../config/cent";
import { StabilityPool as StabilityPoolAbi } from "../../bold-main/frontend/app/src/abi/StabilityPool";

export function useStabilityPool(
  collateralSymbol: string,
  account?: string,
) {
  const [deposit, setDeposit] = useState<string>("0");
  const [collGain, setCollGain] = useState<string>("0");
  const [yieldGain, setYieldGain] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const rpcUrl = getEnv("VITE_RPC_URL");
    const provider = rpcUrl ? new JsonRpcProvider(rpcUrl) : undefined;
    const load = async () => {
      if (!provider || !account) return;
      const branch = getBranchBySymbol(collateralSymbol);
      if (!branch) return;
      setLoading(true);
      setError(null);
      try {
        const sp = new Contract(branch.stabilityPool, StabilityPoolAbi, provider);
        const [d, c, y] = await Promise.all([
          sp.getCompoundedBoldDeposit(account),
          sp.getDepositorCollGain(account),
          sp.getDepositorYieldGain(account),
        ]);
        if (cancelled) return;
        setDeposit((Number(d) / 1e18).toFixed(4));
        setCollGain((Number(c) / 1e18).toFixed(6));
        setYieldGain((Number(y) / 1e18).toFixed(4));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load SP position");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [collateralSymbol, account]);

  return { deposit, collGain, yieldGain, loading, error };
}





