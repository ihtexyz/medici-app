import { BrowserProvider, Contract } from "ethers";

import { CENT_ADDRESSES, getBranchBySymbol, getBranches } from "../config/cent";
import { getEnvOptional as getEnv } from "../lib/runtime-env";

// Minimal ABIs (copied from Liquity v2 frontend bundle)
import { BorrowerOperations as BorrowerOperationsAbi } from "../../bold-main/frontend/app/src/abi/BorrowerOperations";
import { HintHelpers as HintHelpersAbi } from "../../bold-main/frontend/app/src/abi/HintHelpers";
import { SortedTroves as SortedTrovesAbi } from "../../bold-main/frontend/app/src/abi/SortedTroves";
import { StabilityPool as StabilityPoolAbi } from "../../bold-main/frontend/app/src/abi/StabilityPool";
import { MultiTroveGetter as MultiTroveGetterAbi } from "../../bold-main/frontend/app/src/abi/MultiTroveGetter";
import { CollateralRegistry as CollateralRegistryAbi } from "../../bold-main/frontend/app/src/abi/CollateralRegistry";

export type OpenTroveParams = {
  collateralSymbol: string; // e.g., "WBTC18" or "cbBTC18"
  owner: string;
  ownerIndex: bigint; // obtain via subgraph or 0n for MVP
  collAmount: bigint; // 18 decimals (wrappers)
  centAmount: bigint; // debt to mint
  annualInterestRate: bigint; // e.g., 5% => 0.05e18
  maxUpfrontFee: bigint; // slippage guard
};

const ERC20_ABI = [
  { name: "allowance", type: "function", stateMutability: "view", inputs: [
    { name: "owner", type: "address" }, { name: "spender", type: "address" }
  ], outputs: [{ name: "", type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [
    { name: "spender", type: "address" }, { name: "amount", type: "uint256" }
  ], outputs: [{ name: "", type: "bool" }] },
] as const;

const ERC20_FAUCET_ABI = [
  { name: "tap", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

function getCollIndexBySymbol(symbol: string): bigint {
  const list = getBranches();
  const idx = list.findIndex(b => b.collSymbol.toUpperCase() === symbol.toUpperCase());
  return idx >= 0 ? BigInt(idx) : 0n;
}

export async function getHints(
  provider: BrowserProvider,
  collateralSymbol: string,
  interestRate: bigint,
): Promise<{ upperHint: bigint; lowerHint: bigint }> {
  if (!CENT_ADDRESSES) throw new Error("CENT addresses not configured");
  const branch = getBranchBySymbol(collateralSymbol);
  if (!branch) throw new Error(`Unknown collateral: ${collateralSymbol}`);

  const sortedTroves = new Contract(
    branch.sortedTroves,
    SortedTrovesAbi,
    provider,
  );
  try {
    const hintHelpers = new Contract(
      CENT_ADDRESSES.hintHelpers!,
      HintHelpersAbi,
      provider,
    );
    const numTroves: bigint = await sortedTroves.getSize().catch(() => 0n);
    const numTrials = 10n * BigInt(Math.ceil(Math.sqrt(Number(numTroves || 1n))));
    const seed = 42n;
    const collIndex = getCollIndexBySymbol(collateralSymbol);
    const [approxHint] = await hintHelpers.getApproxHint(collIndex, interestRate, numTrials, seed);
    const [upperHint, lowerHint] = await sortedTroves.findInsertPosition(interestRate, approxHint, approxHint);
    return { upperHint, lowerHint };
  } catch {
    // Fallback: no HintHelpers deployed yet. Try to compute using SortedTroves only, else return zeros.
    try {
      const [upperHint, lowerHint] = await sortedTroves.findInsertPosition(interestRate, 0n, 0n);
      return { upperHint, lowerHint };
    } catch {
      return { upperHint: 0n, lowerHint: 0n };
    }
  }
}

export async function openTrove(
  provider: BrowserProvider,
  params: OpenTroveParams,
) {
  if (!CENT_ADDRESSES) throw new Error("CENT addresses not configured");
  const branch = getBranchBySymbol(params.collateralSymbol);
  if (!branch) throw new Error(`Unknown collateral: ${params.collateralSymbol}`);

  const signer = await provider.getSigner();
  const bo = new Contract(branch.borrowerOperations, BorrowerOperationsAbi, signer);

  // Ensure collateral allowance to BorrowerOperations
  const erc20 = new Contract(branch.collToken, ERC20_ABI, signer);
  const current: bigint = await erc20.allowance(params.owner, branch.borrowerOperations);
  if (current < params.collAmount) {
    const txApprove = await erc20.approve(branch.borrowerOperations, params.collAmount);
    await txApprove.wait();
  }

  const { upperHint, lowerHint } = await getHints(provider, params.collateralSymbol, params.annualInterestRate);

  // Approvals for collateral should be handled by caller
  const tx = await bo.openTrove(
    params.owner,
    params.ownerIndex,
    params.collAmount,
    params.centAmount,
    upperHint,
    lowerHint,
    params.annualInterestRate,
    params.maxUpfrontFee,
    "0x0000000000000000000000000000000000000000", // addManager
    "0x0000000000000000000000000000000000000000", // removeManager
    params.owner, // receiver
  );
  return tx.wait();
}

export async function withdrawCent(
  provider: BrowserProvider,
  collateralSymbol: string,
  troveId: bigint,
  amount: bigint,
  maxUpfrontFee: bigint,
) {
  const branch = getBranchBySymbol(collateralSymbol);
  if (!branch) throw new Error("Unknown collateral");
  const signer = await provider.getSigner();
  const bo = new Contract(branch.borrowerOperations, BorrowerOperationsAbi, signer);
  const tx = await bo.withdrawBold(troveId, amount, maxUpfrontFee);
  return tx.wait();
}

export async function repayCent(
  provider: BrowserProvider,
  collateralSymbol: string,
  troveId: bigint,
  amount: bigint,
) {
  const branch = getBranchBySymbol(collateralSymbol);
  if (!branch) throw new Error("Unknown collateral");
  const signer = await provider.getSigner();
  const bo = new Contract(branch.borrowerOperations, BorrowerOperationsAbi, signer);
  const tx = await bo.repayBold(troveId, amount);
  return tx.wait();
}

export async function addCollateral(
  provider: BrowserProvider,
  collateralSymbol: string,
  troveId: bigint,
  amount: bigint,
) {
  const branch = getBranchBySymbol(collateralSymbol);
  if (!branch) throw new Error("Unknown collateral");
  const signer = await provider.getSigner();
  const bo = new Contract(branch.borrowerOperations, BorrowerOperationsAbi, signer);
  const tx = await bo.addColl(troveId, amount);
  return tx.wait();
}

export async function withdrawCollateral(
  provider: BrowserProvider,
  collateralSymbol: string,
  troveId: bigint,
  amount: bigint,
) {
  const branch = getBranchBySymbol(collateralSymbol);
  if (!branch) throw new Error("Unknown collateral");
  const signer = await provider.getSigner();
  const bo = new Contract(branch.borrowerOperations, BorrowerOperationsAbi, signer);
  const tx = await bo.withdrawColl(troveId, amount);
  return tx.wait();
}

export async function closeTrove(
  provider: BrowserProvider,
  collateralSymbol: string,
  troveId: bigint,
) {
  const branch = getBranchBySymbol(collateralSymbol);
  if (!branch) throw new Error("Unknown collateral");
  const signer = await provider.getSigner();
  const bo = new Contract(branch.borrowerOperations, BorrowerOperationsAbi, signer);
  const tx = await bo.closeTrove(troveId);
  return tx.wait();
}

export async function adjustInterestRate(
  provider: BrowserProvider,
  collateralSymbol: string,
  troveId: bigint,
  newAnnualInterestRate: bigint,
  maxUpfrontFee: bigint,
) {
  const branch = getBranchBySymbol(collateralSymbol);
  if (!branch) throw new Error("Unknown collateral");
  const signer = await provider.getSigner();
  const bo = new Contract(branch.borrowerOperations, BorrowerOperationsAbi, signer);
  const { upperHint, lowerHint } = await getHints(provider, collateralSymbol, newAnnualInterestRate);
  const tx = await bo.adjustTroveInterestRate(
    troveId,
    newAnnualInterestRate,
    upperHint,
    lowerHint,
    maxUpfrontFee,
  );
  return tx.wait();
}

export async function spDeposit(
  provider: BrowserProvider,
  collateralSymbol: string,
  amount: bigint,
  doClaim = true,
) {
  const branch = getBranchBySymbol(collateralSymbol);
  if (!branch) throw new Error("Unknown collateral");
  const signer = await provider.getSigner();
  const sp = new Contract(branch.stabilityPool, StabilityPoolAbi, signer);
  const tx = await sp.provideToSP(amount, doClaim);
  return tx.wait();
}

export async function spWithdraw(
  provider: BrowserProvider,
  collateralSymbol: string,
  amount: bigint,
  doClaim = true,
) {
  const branch = getBranchBySymbol(collateralSymbol);
  if (!branch) throw new Error("Unknown collateral");
  const signer = await provider.getSigner();
  const sp = new Contract(branch.stabilityPool, StabilityPoolAbi, signer);
  const tx = await sp.withdrawFromSP(amount, doClaim);
  return tx.wait();
}

export async function getTroveData(
  provider: BrowserProvider,
  collateralSymbol: string,
  startIdx = 0n,
  count = 50n,
) {
  if (!CENT_ADDRESSES) throw new Error("CENT addresses not configured");
  const mtg = new Contract(CENT_ADDRESSES.multiTroveGetter!, MultiTroveGetterAbi, provider);
  const collIndex = getCollIndexBySymbol(collateralSymbol);
  return mtg.getMultipleSortedTroves(collIndex, BigInt(startIdx), BigInt(count));
}

export async function faucetTap(
  provider: BrowserProvider,
  tokenSymbol: string,
) {
  if (!CENT_ADDRESSES) throw new Error("CENT addresses not configured");
  const signer = await provider.getSigner();

  // Handle CENT token (boldToken) separately
  if (tokenSymbol.toUpperCase() === 'CENT' || tokenSymbol.toUpperCase() === 'BOLD') {
    const faucet = new Contract(CENT_ADDRESSES.boldToken, ERC20_FAUCET_ABI, signer);
    const tx = await faucet.tap();
    return tx.wait();
  }

  // Handle collateral tokens
  const branch = getBranchBySymbol(tokenSymbol);
  if (!branch) throw new Error(`Unknown token: ${tokenSymbol}`);
  const faucet = new Contract(branch.collToken, ERC20_FAUCET_ABI, signer);
  const tx = await faucet.tap();
  return tx.wait();
}

/**
 * Redemption Functions
 */

export async function getRedemptionRate(provider: BrowserProvider): Promise<bigint> {
  if (!CENT_ADDRESSES) throw new Error("CENT addresses not configured");
  const cr = new Contract(CENT_ADDRESSES.collateralRegistry!, CollateralRegistryAbi, provider);
  return cr.getRedemptionRate();
}

export async function getRedemptionRateForAmount(
  provider: BrowserProvider,
  centAmount: bigint,
): Promise<bigint> {
  if (!CENT_ADDRESSES) throw new Error("CENT addresses not configured");
  const cr = new Contract(CENT_ADDRESSES.collateralRegistry!, CollateralRegistryAbi, provider);
  return cr.getRedemptionRateForRedeemedAmount(centAmount);
}

export async function getRedemptionFee(
  provider: BrowserProvider,
  centAmount: bigint,
): Promise<bigint> {
  if (!CENT_ADDRESSES) throw new Error("CENT addresses not configured");
  const cr = new Contract(CENT_ADDRESSES.collateralRegistry!, CollateralRegistryAbi, provider);
  return cr.getEffectiveRedemptionFeeInBold(centAmount);
}

export async function redeemCollateral(
  provider: BrowserProvider,
  centAmount: bigint,
  maxFeePercentage: bigint,
  maxIterationsPerCollateral: bigint = 10n,
) {
  if (!CENT_ADDRESSES) throw new Error("CENT addresses not configured");
  const signer = await provider.getSigner();
  const cr = new Contract(CENT_ADDRESSES.collateralRegistry!, CollateralRegistryAbi, signer);
  const tx = await cr.redeemCollateral(centAmount, maxIterationsPerCollateral, maxFeePercentage);
  return tx.wait();
}


