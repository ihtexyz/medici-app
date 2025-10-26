import { useEffect, useState } from "react";
import { JsonRpcProvider, keccak256, AbiCoder } from "ethers";

import { getEnvOptional as getEnv } from "../lib/runtime-env";
import { CENT_ADDRESSES, getBranches } from "../config/cent";
import { TroveData, useTrove } from "./useTrove";

export type TrovePosition = {
  collateralSymbol: string;
  data: TroveData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch all Trove positions across all collateral types
 * Useful for portfolio overview
 */
export function useAllTroves(owner: string | undefined, ownerIndex: bigint = 0n) {
  const [positions, setPositions] = useState<TrovePosition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!owner || !CENT_ADDRESSES) {
      setPositions([]);
      return;
    }

    const branches = getBranches();
    const initialPositions: TrovePosition[] = branches.map(b => ({
      collateralSymbol: b.collSymbol,
      data: null,
      loading: true,
      error: null,
    }));

    setPositions(initialPositions);
    setLoading(true);

    // Fetch all Trove positions in parallel
    Promise.all(
      branches.map(async (branch) => {
        try {
          const rpcUrl = getEnv("VITE_RPC_URL");
          if (!rpcUrl) throw new Error("RPC URL not configured");

          const provider = new JsonRpcProvider(rpcUrl);
          const { Contract } = await import("ethers");
          const { TroveManager: TroveManagerAbi } = await import("../../bold-main/frontend/app/src/abi/TroveManager");

          const tm = new Contract(branch.troveManager, TroveManagerAbi, provider);
          const troveId = computeTroveId(owner, ownerIndex);
          const td = await tm.getLatestTroveData(troveId);

          const data: TroveData = {
            entireDebt: td.entireDebt ?? td[0] ?? 0n,
            entireColl: td.entireColl ?? td[1] ?? 0n,
            annualInterestRate: td.annualInterestRate ?? td[6] ?? 0n,
            lastInterestRateAdjTime: td.lastInterestRateAdjTime ?? td[7] ?? 0n,
            recordedDebt: td.recordedDebt ?? td[5] ?? 0n,
            weightedRecordedDebt: td.weightedRecordedDebt ?? td[12] ?? 0n,
          };

          return {
            collateralSymbol: branch.collSymbol,
            data,
            loading: false,
            error: null,
          };
        } catch (e) {
          return {
            collateralSymbol: branch.collSymbol,
            data: null,
            loading: false,
            error: e instanceof Error ? e.message : "Failed to load",
          };
        }
      })
    ).then((results) => {
      setPositions(results);
      setLoading(false);
    });
  }, [owner, ownerIndex]);

  // Filter out positions with no debt and no collateral
  const activeTroves = positions.filter(
    p => p.data && (p.data.entireDebt > 0n || p.data.entireColl > 0n)
  );

  return {
    positions,
    activeTroves,
    loading,
    hasAnyTrove: activeTroves.length > 0,
  };
}

function computeTroveId(owner: string, ownerIndex: bigint): bigint {
  const coder = AbiCoder.defaultAbiCoder();
  const encoded = coder.encode(["address", "uint256"], [owner, ownerIndex]);
  return BigInt(keccak256(encoded));
}
