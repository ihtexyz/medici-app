import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { getBranches } from "../config/cent"

/**
 * Hook to fetch stability pool statistics
 * Returns total deposits, APR, and other pool metrics
 */

const STABILITY_POOL_ABI = [
  "function getTotalBoldDeposits() view returns (uint256)",
  "function getYieldGainsOwed() view returns (uint256)",
  "function getYieldGainsPending() view returns (uint256)",
] as const

export interface PoolStats {
  totalDeposits: string // Total CENT deposited in pool
  yieldGainsOwed: string // Total yield owed to depositors
  yieldGainsPending: string // Pending yield distribution
  estimatedAPR: number // Estimated APR based on recent yield
  loading: boolean
  error: string | null
}

export function usePoolStats(
  collateralSymbol: string,
  rpcUrl?: string
): PoolStats {
  const [stats, setStats] = useState<PoolStats>({
    totalDeposits: "0",
    yieldGainsOwed: "0",
    yieldGainsPending: "0",
    estimatedAPR: 0,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!rpcUrl) {
      setStats(prev => ({ ...prev, loading: false, error: "No RPC URL provided" }))
      return
    }

    let cancelled = false

    async function fetchStats() {
      try {
        const branches = getBranches()
        const branch = branches.find(b => b.collSymbol === collateralSymbol)

        if (!branch) {
          throw new Error(`Branch not found for ${collateralSymbol}`)
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const stabilityPool = new ethers.Contract(
          branch.stabilityPool,
          STABILITY_POOL_ABI,
          provider
        )

        // Fetch pool statistics
        const [totalDeposits, yieldGainsOwed, yieldGainsPending] = await Promise.all([
          stabilityPool.getTotalBoldDeposits().catch(() => 0n),
          stabilityPool.getYieldGainsOwed().catch(() => 0n),
          stabilityPool.getYieldGainsPending().catch(() => 0n),
        ])

        if (cancelled) return

        // Calculate estimated APR
        // APR = (annualized yield / total deposits) * 100
        // For now, using a simple estimation based on pending yield
        const totalDepositsNum = Number(totalDeposits) / 1e18
        const yieldGainsPendingNum = Number(yieldGainsPending) / 1e18

        // Estimate APR: assuming pending yield represents 1 week of accumulation
        // Annualized: (weekly yield * 52) / total deposits * 100
        const weeklyYield = yieldGainsPendingNum
        const annualizedYield = weeklyYield * 52
        const estimatedAPR = totalDepositsNum > 0
          ? (annualizedYield / totalDepositsNum) * 100
          : 0

        setStats({
          totalDeposits: (Number(totalDeposits) / 1e18).toFixed(2),
          yieldGainsOwed: (Number(yieldGainsOwed) / 1e18).toFixed(6),
          yieldGainsPending: (Number(yieldGainsPending) / 1e18).toFixed(6),
          estimatedAPR: Math.min(estimatedAPR, 100), // Cap at 100% for display
          loading: false,
          error: null,
        })
      } catch (err) {
        if (cancelled) return
        console.error("Error fetching pool stats:", err)
        setStats(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to fetch pool stats",
        }))
      }
    }

    fetchStats()

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [collateralSymbol, rpcUrl])

  return stats
}
