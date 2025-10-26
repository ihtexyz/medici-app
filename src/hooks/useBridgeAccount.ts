import { useState, useEffect } from "react"
import { useAppKitAccount } from '@reown/appkit/react'

import { listVirtualAccounts, getVirtualAccountTransactions } from "../services/bridge"
import type { VirtualAccount, VirtualAccountTransaction } from "../types/bridge"

export function useBridgeAccount() {
  const { address } = useAppKitAccount()
  const [accounts, setAccounts] = useState<VirtualAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setAccounts([])
      return
    }

    const loadAccounts = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await listVirtualAccounts()
        if (response.success && response.data) {
          setAccounts(response.data.data)
        } else {
          setError(response.error?.message || "Failed to load accounts")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load accounts")
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [address])

  const primaryAccount = accounts.length > 0 ? accounts[0] : null

  return {
    accounts,
    primaryAccount,
    loading,
    error,
  }
}

export function useAccountTransactions(accountId: string | undefined) {
  const [transactions, setTransactions] = useState<VirtualAccountTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accountId) {
      setTransactions([])
      return
    }

    const loadTransactions = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getVirtualAccountTransactions(accountId)
        if (response.success && response.data) {
          setTransactions(response.data.data)
        } else {
          setError(response.error?.message || "Failed to load transactions")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [accountId])

  return {
    transactions,
    loading,
    error,
  }
}
