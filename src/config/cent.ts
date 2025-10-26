import { getEnvOptional as getEnv } from "../lib/runtime-env";

// Lightweight runtime config loader for CENT (Liquity v2 fork)
// Expects VITE_CENT_ADDRESSES_JSON to be a JSON string with the following shape (subset):
// {
//   "boldToken": "0x...",
//   "collateralRegistry": "0x...",
//   "hintHelpers": "0x...",
//   "multiTroveGetter": "0x...",
//   "branches": [
//     {
//       "collSymbol": "WBTC18",
//       "collToken": "0x...",
//       "borrowerOperations": "0x...",
//       "sortedTroves": "0x...",
//       "stabilityPool": "0x...",
//       "troveManager": "0x...",
//       "priceFeed": "0x..."
//     },
//     { "collSymbol": "cbBTC18", ... }
//   ]
// }

export type CentBranch = {
  collSymbol: string;
  collToken: string;
  borrowerOperations: string;
  sortedTroves: string;
  stabilityPool: string;
  troveManager: string;
  priceFeed?: string;
  addressesRegistry?: string;
};

export type CentAddresses = {
  boldToken: string;
  collateralRegistry?: string;
  hintHelpers?: string;
  multiTroveGetter?: string;
  branches: CentBranch[];
};

function parseAddresses(): CentAddresses | null {
  const raw = getEnv("VITE_CENT_ADDRESSES_JSON");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed as CentAddresses;
  } catch {
    return null;
  }
}

export const CENT_ADDRESSES: CentAddresses | null = parseAddresses();

export function getCentTokenAddress(): string | null {
  return CENT_ADDRESSES?.boldToken ?? null;
}

export function getBranches(): CentBranch[] {
  return CENT_ADDRESSES?.branches ?? [];
}

export function getBranchBySymbol(symbol: string): CentBranch | undefined {
  const upper = symbol.toUpperCase();
  return getBranches().find((b) => b.collSymbol.toUpperCase() === upper);
}



