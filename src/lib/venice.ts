import { Contract, JsonRpcProvider } from "ethers"

import { CONTRACTS } from "../config/contracts"

export type MarketSnapshot = {
  marketId: string
  bestLendAprBps?: number
  bestBorrowAprBps?: number
  totalLendUsd?: number
  totalBorrowUsd?: number
}

export async function fetchMarketSnapshot(
  rpcUrl: string | undefined,
  marketId: string,
): Promise<MarketSnapshot> {
  if (!rpcUrl) return { marketId }
  const provider = new JsonRpcProvider(rpcUrl)
  await provider.getNetwork()

  // Minimal ABI for aggregated stats
  const VENICE_FI_ABI = [
    {
      name: "nextOfferId",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      name: "nextDemandId",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      name: "protocolFeeRate",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
    },
  ] as const

  const core = new Contract(CONTRACTS.VeniceFiCore, VENICE_FI_ABI, provider)

  const [offerIdBn, demandIdBn, protocolFeeRateBn] = await Promise.all([
    core.nextOfferId().catch(() => 0n),
    core.nextDemandId().catch(() => 0n),
    core.protocolFeeRate().catch(() => 0n),
  ])
  const offerId = Number(offerIdBn || 0n)
  const demandId = Number(demandIdBn || 0n)

  const totalLendUsd = offerId * 1000 // placeholder metric until subgraph
  const totalBorrowUsd = demandId * 1000
  const bestLendAprBps = Number(protocolFeeRateBn) || undefined
  const bestBorrowAprBps = undefined

  return {
    marketId,
    bestLendAprBps,
    bestBorrowAprBps,
    totalLendUsd,
    totalBorrowUsd,
  }
}
