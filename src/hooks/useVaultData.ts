/**
 * useVaultData hook
 * Fetches and manages vault data for the Invest page
 */

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { fetchMultipleVaults, type VaultData } from '../services/vaultData'

interface UseVaultDataReturn {
  vaults: Record<string, VaultData>
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook to fetch and manage vault data
 * @param rpcUrl - RPC endpoint URL
 * @param vaultAddresses - Array of vault contract addresses
 * @param userAddress - Optional user address to fetch balances
 * @param pollingInterval - How often to refresh data (in ms), default 30s
 */
export function useVaultData(
  rpcUrl: string,
  vaultAddresses: string[],
  userAddress?: string,
  pollingInterval: number = 30000
): UseVaultDataReturn {
  const [vaults, setVaults] = useState<Record<string, VaultData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (vaultAddresses.length === 0) {
      setLoading(false)
      return
    }

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const vaultData = await fetchMultipleVaults(provider, vaultAddresses, userAddress)

      setVaults(vaultData)
      setError(null)
    } catch (err) {
      console.error('Error fetching vault data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch vault data')
    } finally {
      setLoading(false)
    }
  }, [rpcUrl, vaultAddresses, userAddress])

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
    vaults,
    loading,
    error,
    refresh,
  }
}


