import { useEffect, useMemo, useState } from "react";
import { Contract, JsonRpcProvider, keccak256, AbiCoder } from "ethers";

import { getEnvOptional as getEnv } from "../lib/runtime-env";
import { CENT_ADDRESSES, getBranchBySymbol } from "../config/cent";
import { TroveManager as TroveManagerAbi } from "../../bold-main/frontend/app/src/abi/TroveManager";

export type TroveData = {
  entireDebt: bigint;
  entireColl: bigint;
  annualInterestRate: bigint;
  lastInterestRateAdjTime: bigint;
  recordedDebt: bigint;
  weightedRecordedDebt: bigint;
};

function computeTroveId(owner: string, ownerIndex: bigint): bigint {
  // keccak256(abi.encode(address, uint256))
  const coder = AbiCoder.defaultAbiCoder();
  const encoded = coder.encode(["address", "uint256"], [owner, ownerIndex]);
  return BigInt(keccak256(encoded));
}

export function useTrove(collateralSymbol: string, owner: string | undefined, ownerIndex: bigint = 0n) {
  const [data, setData] = useState<TroveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rpcUrl = getEnv("VITE_RPC_URL");
  const provider = useMemo(() => (rpcUrl ? new JsonRpcProvider(rpcUrl) : undefined), [rpcUrl]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!CENT_ADDRESSES || !provider || !owner) return;
      const branch = getBranchBySymbol(collateralSymbol);
      if (!branch) return;
      setLoading(true);
      setError(null);
      try {
        const tm = new Contract(branch.troveManager, TroveManagerAbi, provider);
        const troveId = computeTroveId(owner, ownerIndex);
        const td = await tm.getLatestTroveData(troveId);
        if (cancelled) return;
        setData({
          entireDebt: td.entireDebt ?? td[0] ?? 0n,
          entireColl: td.entireColl ?? td[1] ?? 0n,
          annualInterestRate: td.annualInterestRate ?? td[6] ?? 0n,
          lastInterestRateAdjTime: td.lastInterestRateAdjTime ?? td[7] ?? 0n,
          recordedDebt: td.recordedDebt ?? td[5] ?? 0n,
          weightedRecordedDebt: td.weightedRecordedDebt ?? td[12] ?? 0n,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load trove");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [provider, owner, ownerIndex, collateralSymbol]);

  return { data, loading, error };
}





