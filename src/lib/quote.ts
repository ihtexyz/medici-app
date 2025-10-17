import { Contract, JsonRpcProvider } from "ethers"

import { CONTRACTS } from "../config/contracts"

const VENICE_FI_ABI = [
  {
    name: "loanOffers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "lender", type: "address" },
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interestRate", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "collateralRatio", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    name: "loanDemands",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "borrower", type: "address" },
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "maxInterestRate", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "collateralAsset", type: "address" },
      { name: "collateralAmount", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "createdAt", type: "uint256" },
    ],
  },
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
] as const

type OfferRoute = {
  id: number
  aprBps: number
  amountUsd: number
  collateralRatioBps?: number
}

type DemandRoute = {
  id: number
  aprBps: number
  amountUsd: number
}

async function requestBatch<T>(
  ids: number[],
  fetcher: (id: number) => Promise<T | null>,
): Promise<T[]> {
  const results = await Promise.all(ids.map(fetcher))
  return results.filter(
    (item): item is NonNullable<typeof item> => item !== null,
  )
}

export type QuoteRequest = {
  rpcUrl: string
  side: "borrow" | "lend"
  amountUsd: number
}

export type QuoteResult = {
  aprBps: number
  aprMinBps: number
  aprMaxBps: number
  estFeesUsd: number
  coverageUsd: number
  routes: Array<OfferRoute | DemandRoute>
  source: "venice"
}

function weightedAverage(routes: Array<{ aprBps: number; amountUsd: number }>) {
  const total = routes.reduce((sum, r) => sum + r.amountUsd, 0)
  if (!total) return routes[0]?.aprBps ?? 0
  const weightedSum = routes.reduce((sum, r) => sum + r.aprBps * r.amountUsd, 0)
  return weightedSum / total
}

export async function fetchBestQuote(
  req: QuoteRequest,
): Promise<QuoteResult | null> {
  const provider = new JsonRpcProvider(req.rpcUrl)
  const core = new Contract(CONTRACTS.VeniceFiCore, VENICE_FI_ABI, provider)
  const maxScan = 250

  if (req.side === "borrow") {
    const nextOffer = Number(await core.nextOfferId().catch(() => 0n))
    if (!nextOffer) return null
    const ids = Array.from(
      { length: Math.min(nextOffer, maxScan) },
      (_, i) => i + 1,
    )
    const offers = await requestBatch<OfferRoute>(ids, async (id) => {
      const offer = await core.loanOffers(id).catch(() => null)
      if (!offer || !offer.isActive) return null
      const aprBps = Number(offer.interestRate) || 0
      const amountUsd = Number(offer.amount) || 0
      if (!Number.isFinite(aprBps) || aprBps <= 0 || amountUsd <= 0) return null
      return {
        id: Number(offer.id),
        aprBps,
        amountUsd,
        collateralRatioBps: Number(offer.collateralRatio) || undefined,
      }
    })

    if (!offers.length) return null
    offers.sort((a, b) => a.aprBps - b.aprBps)
    const routes: QuoteResult["routes"] = []
    let covered = 0
    for (const offer of offers) {
      routes.push(offer)
      covered += offer.amountUsd
      if (covered >= req.amountUsd) break
    }
    const aprValues = routes.map((r) => r.aprBps).sort((a, b) => a - b)
    const aprBps = weightedAverage(routes)
    const aprMinBps = aprValues[0]
    const aprMaxBps = aprValues[aprValues.length - 1]
    const estFeesUsd = Math.max(2.23, req.amountUsd * 0.001)
    return {
      aprBps,
      aprMinBps,
      aprMaxBps,
      estFeesUsd,
      coverageUsd: covered,
      routes,
      source: "venice",
    }
  }

  // side === 'lend'
  const nextDemand = Number(await core.nextDemandId().catch(() => 0n))
  if (!nextDemand) return null
  const ids = Array.from(
    { length: Math.min(nextDemand, maxScan) },
    (_, i) => i + 1,
  )
  const demands = await requestBatch<DemandRoute>(ids, async (id) => {
    const demand = await core.loanDemands(id).catch(() => null)
    if (!demand || !demand.isActive) return null
    const aprBps = Number(demand.maxInterestRate) || 0
    const amountUsd = Number(demand.amount) || 0
    if (!Number.isFinite(aprBps) || aprBps <= 0 || amountUsd <= 0) return null
    return {
      id: Number(demand.id),
      aprBps,
      amountUsd,
    }
  })

  if (!demands.length) return null
  demands.sort((a, b) => b.aprBps - a.aprBps)
  const routes: QuoteResult["routes"] = []
  let covered = 0
  for (const demand of demands) {
    routes.push(demand)
    covered += demand.amountUsd
    if (covered >= req.amountUsd) break
  }
  const aprValues = routes.map((r) => r.aprBps).sort((a, b) => a - b)
  const aprBps = weightedAverage(routes)
  const aprMinBps = aprValues[0]
  const aprMaxBps = aprValues[aprValues.length - 1]
  const estFeesUsd = Math.max(1.5, req.amountUsd * 0.0008)
  return {
    aprBps,
    aprMinBps,
    aprMaxBps,
    estFeesUsd,
    coverageUsd: covered,
    routes,
    source: "venice",
  }
}
