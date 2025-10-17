import { BrowserProvider, Contract, JsonRpcProvider } from "ethers"

import { CONTRACTS } from "../config/contracts"
import { getEnv, getEnvOptional } from "../lib/runtime-env"

const ERC20_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const

const VENICE_FINANCE_ABI = [
  {
    name: "createLoanDemand",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_borrower", type: "address" },
      { name: "_asset", type: "address" },
      { name: "_amount", type: "uint256" },
      { name: "_maxInterestRate", type: "uint256" },
      { name: "_duration", type: "uint256" },
      { name: "_collateralAsset", type: "address" },
      { name: "_collateralAmount", type: "uint256" },
      { name: "_orderType", type: "uint8" },
      { name: "_slippageTolerance", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "cancelLoanDemand",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_demandId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "createLoanOffer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_lender", type: "address" },
      { name: "_asset", type: "address" },
      { name: "_amount", type: "uint256" },
      { name: "_interestRate", type: "uint256" },
      { name: "_duration", type: "uint256" },
      { name: "_collateralRatio", type: "uint256" },
      { name: "_orderType", type: "uint8" },
      { name: "_slippageTolerance", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "cancelLoanOffer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_offerId", type: "uint256" }],
    outputs: [],
  },
] as const

export type BorrowIntent = {
  amountUSD: number
  aprBps: number
  durationSeconds: number
  collateralAsset: string
  collateralAmount: bigint
}

export type EarnIntent = {
  amountUSD: number
  asset: string
  aprBps: number
}

export type SignerProvider = BrowserProvider | JsonRpcProvider

export type ProgressCallback = (message: string) => void
export type TxOptions = { onProgress?: ProgressCallback }

export async function ensureTokenAllowance(
  provider: SignerProvider,
  tokenAddress: string,
  spender: string,
  amount: bigint,
  onProgress?: ProgressCallback,
) {
  if (onProgress) onProgress("Checking token allowance…")
  const signer = await provider.getSigner()
  const address = await signer.getAddress()
  const token = new Contract(tokenAddress, ERC20_ABI, signer)
  const allowance: bigint = await token.allowance(address, spender)
  if (allowance >= amount) return
  if (onProgress) onProgress("Approving spending limit…")
  const tx = await token.approve(spender, amount)
  await tx.wait()
  if (onProgress) onProgress("Approval confirmed.")
}

export async function submitBorrowIntent(
  provider: SignerProvider,
  intent: BorrowIntent,
  opts?: TxOptions,
) {
  const signer = await provider.getSigner()
  const borrower = await signer.getAddress()
  const contract = new Contract(
    CONTRACTS.VeniceFiCore,
    VENICE_FINANCE_ABI,
    signer,
  )
  const amount = BigInt(Math.round(intent.amountUSD * 1_000_000))
  await ensureTokenAllowance(
    provider,
    intent.collateralAsset,
    CONTRACTS.VeniceFiCore,
    intent.collateralAmount,
    opts?.onProgress,
  )
  if (opts?.onProgress) opts.onProgress("Submitting borrow intent…")
  const tx = await contract.createLoanDemand(
    borrower,
    CONTRACTS.MockUSDC,
    amount,
    BigInt(intent.aprBps),
    BigInt(intent.durationSeconds),
    intent.collateralAsset,
    intent.collateralAmount,
    0,
    0,
  )
  if (opts?.onProgress) opts.onProgress(`Transaction sent: ${tx.hash.slice(0, 10)}…`)
  const receipt = await tx.wait()
  if (opts?.onProgress) opts.onProgress("Borrow confirmed.")
  // Optional safety: reset allowance to 0 after use
  try {
    const reset = getEnvOptional("VITE_RESET_ALLOWANCE_AFTER_TX")
    if (reset && reset.toLowerCase() === "true") {
      const token = new Contract(intent.collateralAsset, ERC20_ABI, signer)
      if (opts?.onProgress) opts.onProgress("Resetting collateral allowance…")
      const resetTx = await token.approve(CONTRACTS.VeniceFiCore, 0n)
      await resetTx.wait()
      if (opts?.onProgress) opts.onProgress("Collateral allowance reset.")
    }
  } catch {}
  return receipt
}

export async function submitEarnIntent(
  provider: SignerProvider,
  intent: EarnIntent,
  opts?: TxOptions,
) {
  const signer = await provider.getSigner()
  const lender = await signer.getAddress()
  const contract = new Contract(
    CONTRACTS.VeniceFiCore,
    VENICE_FINANCE_ABI,
    signer,
  )
  const amount = BigInt(Math.round(intent.amountUSD * 1_000_000))
  await ensureTokenAllowance(
    provider,
    intent.asset,
    CONTRACTS.VeniceFiCore,
    amount,
    opts?.onProgress,
  )
  if (opts?.onProgress) opts.onProgress("Submitting deposit intent…")
  const tx = await contract.createLoanOffer(
    lender,
    intent.asset,
    amount,
    BigInt(intent.aprBps),
    BigInt(30 * 24 * 60 * 60),
    BigInt(15000),
    0,
    0,
  )
  if (opts?.onProgress) opts.onProgress(`Transaction sent: ${tx.hash.slice(0, 10)}…`)
  const receipt = await tx.wait()
  if (opts?.onProgress) opts.onProgress("Deposit confirmed.")
  // Optional safety: reset allowance to 0 after use
  try {
    const reset = getEnvOptional("VITE_RESET_ALLOWANCE_AFTER_TX")
    if (reset && reset.toLowerCase() === "true") {
      const token = new Contract(intent.asset, ERC20_ABI, signer)
      if (opts?.onProgress) opts.onProgress("Resetting deposit token allowance…")
      const resetTx = await token.approve(CONTRACTS.VeniceFiCore, 0n)
      await resetTx.wait()
      if (opts?.onProgress) opts.onProgress("Token allowance reset.")
    }
  } catch {}
  return receipt
}

export async function cancelOffer(provider: SignerProvider, offerId: number) {
  const signer = await provider.getSigner()
  const contract = new Contract(
    CONTRACTS.VeniceFiCore,
    VENICE_FINANCE_ABI,
    signer,
  )
  const tx = await contract.cancelLoanOffer(BigInt(offerId))
  return tx.wait()
}

export async function cancelDemand(provider: SignerProvider, demandId: number) {
  const signer = await provider.getSigner()
  const contract = new Contract(
    CONTRACTS.VeniceFiCore,
    VENICE_FINANCE_ABI,
    signer,
  )
  const tx = await contract.cancelLoanDemand(BigInt(demandId))
  return tx.wait()
}

const CENT_REWARD_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_recipient", type: "address" },
      { internalType: "uint256", name: "_claimable", type: "uint256" },
      { internalType: "uint256", name: "_reward", type: "uint256" },
      { internalType: "uint256", name: "_expiry", type: "uint256" },
      { internalType: "bytes", name: "_signature", type: "bytes" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "claimed",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "claimable",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export type RewardClaim = {
  amount: bigint
  claimable: bigint
  reward: bigint
  expiry: bigint
  proof: string[]
  signature?: string
}

export async function claimRewards(
  provider: SignerProvider,
  payload: RewardClaim,
) {
  const rewardAddress = getEnv("VITE_CENT_REWARD_ADDRESS")

  if (!rewardAddress || rewardAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("CENT reward contract address not configured")
  }

  const signer = await provider.getSigner()
  const contract = new Contract(rewardAddress, CENT_REWARD_ABI, signer)

  const args: [string, bigint, bigint, bigint, string | undefined] = [
    await signer.getAddress(),
    payload.claimable,
    payload.reward,
    payload.expiry,
    payload.signature,
  ]

  const tx = await contract.claim(...args)
  return tx.wait()
}
