import { useEffect, useState } from "react"
import { Contract, JsonRpcProvider } from "ethers"

import { CONTRACTS } from "../config/contracts"
import { getEnvOptional as getEnv } from "../lib/runtime-env"

import useWallet from "./useWallet"

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

const CORE_ABI = [
  {
    name: "getUserOffers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getUserDemands",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
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
    ],
  },
] as const

export type PortfolioSnapshot = {
  centBalance: string
  btcBalance: string
  offers: Array<{ id: number; asset: string; amount: string; rate: string }>
  demands: Array<{ id: number; asset: string; amount: string; maxRate: string }>
}

export function usePortfolio() {
  const rpcUrlEnv = getEnv("VITE_RPC_URL")
  const { provider, address } = useWallet(rpcUrlEnv)
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return undefined
    const rpcProvider =
      provider ?? (rpcUrlEnv ? new JsonRpcProvider(rpcUrlEnv) : undefined)
    if (!rpcProvider) return undefined
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const signer = provider ? await provider.getSigner() : undefined
        const addr = signer ? await signer.getAddress() : address
        const centAddress = getEnv("VITE_CENT_ADDRESS") || CONTRACTS.MockUSDC
        const cent = new Contract(
          centAddress,
          ERC20_ABI,
          rpcProvider,
        )
        const wbtc = new Contract(CONTRACTS.MockWBTC, ERC20_ABI, rpcProvider)
        const core = new Contract(CONTRACTS.VeniceFiCore, CORE_ABI, rpcProvider)
        const [centBal, btcBal] = await Promise.all([
          cent.balanceOf(addr).catch(() => 0n),
          wbtc.balanceOf(addr).catch(() => 0n),
        ])
        const [offerIds, demandIds] = await Promise.all([
          core.getUserOffers(addr).catch(() => []),
          core.getUserDemands(addr).catch(() => []),
        ])
        const offers = await Promise.all(
          (offerIds as bigint[]).slice(0, 20).map(async (id) => {
            const offer = await core.loanOffers(id).catch(() => null)
            if (!offer || !offer.isActive) return null
            return {
              id: Number(offer.id),
              asset: offer.asset as string,
              amount: (Number(offer.amount) / 1e6).toFixed(2),
              rate: (Number(offer.interestRate) / 100).toFixed(2),
            }
          }),
        )
        const demands = await Promise.all(
          (demandIds as bigint[]).slice(0, 20).map(async (id) => {
            const demand = await core.loanDemands(id).catch(() => null)
            if (!demand || !demand.isActive) return null
            return {
              id: Number(demand.id),
              asset: demand.asset as string,
              amount: (Number(demand.amount) / 1e6).toFixed(2),
              maxRate: (Number(demand.maxInterestRate) / 100).toFixed(2),
            }
          }),
        )
        if (cancelled) return
        const filteredOffers = offers.filter(
          (offer): offer is NonNullable<typeof offer> => Boolean(offer),
        )
        const filteredDemands = demands.filter(
          (demand): demand is NonNullable<typeof demand> => Boolean(demand),
        )
        setSnapshot({
          centBalance: (Number(centBal) / 1e6).toFixed(2),
          btcBalance: (Number(btcBal) / 1e8).toFixed(6),
          offers: filteredOffers,
          demands: filteredDemands,
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const timer = setInterval(load, 15000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [provider, address])

  return { snapshot, loading }
}
