/**
 * useMarketData hook
 * Fetches and manages market statistics and token prices
 */

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import {
  fetchMarketStats,
  fetchTokenPrices,
  type MarketStats,
  type TokenPrice,
} from '../services/marketData'

interface UseMarketDataReturn {
  stats: MarketStats | null
  prices: Record<string, TokenPrice>
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook to fetch and manage market data
 * @param rpcUrl - RPC endpoint URL
 * @param pollingInterval - How often to refresh data (in ms), default 30s
 */
export function useMarketData(
  rpcUrl: string,
  pollingInterval: number = 30000
): UseMarketDataReturn {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)

      const [marketStats, tokenPrices] = await Promise.all([
        fetchMarketStats(provider),
        fetchTokenPrices(provider),
      ])

      setStats(marketStats)
      setPrices(tokenPrices)
      setError(null)
    } catch (err) {
      console.error('Error fetching market data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch market data')
    } finally {
      setLoading(false)
    }
  }, [rpcUrl])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Polling
  useEffect(() => {
    if (pollingInterval > 0) {
      const interval = setInterval(fetchData, pollingInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, pollingInterval])

  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchData()
  }, [fetchData])

  return {
    stats,
    prices,
    loading,
    error,
    refresh,
  }
}

