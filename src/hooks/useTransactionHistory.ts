import { useState, useEffect, useCallback } from "react"
import type { Transaction, TransactionType, TransactionStatus } from "../types/transaction"

/**
 * Hook to manage transaction history
 * Stores transactions in localStorage for persistence
 */

const STORAGE_KEY = "medici_transaction_history"
const MAX_TRANSACTIONS = 100 // Keep last 100 transactions

export function useTransactionHistory(walletAddress?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // Load transactions from localStorage on mount
  useEffect(() => {
    if (!walletAddress) {
      setTransactions([])
      setLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${walletAddress}`)
      if (stored) {
        const parsed = JSON.parse(stored) as Transaction[]
        // Sort by timestamp descending (newest first)
        const sorted = parsed.sort((a, b) => b.timestamp - a.timestamp)
        setTransactions(sorted)
      }
    } catch (error) {
      console.error("Error loading transaction history:", error)
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (!walletAddress || transactions.length === 0) return

    try {
      // Keep only the most recent MAX_TRANSACTIONS
      const toStore = transactions.slice(0, MAX_TRANSACTIONS)
      localStorage.setItem(`${STORAGE_KEY}_${walletAddress}`, JSON.stringify(toStore))
    } catch (error) {
      console.error("Error saving transaction history:", error)
    }
  }, [transactions, walletAddress])

  // Add a new transaction
  const addTransaction = useCallback((
    type: TransactionType,
    amount: string,
    token: string,
    description: string,
    hash?: string,
    metadata?: Record<string, any>
  ) => {
    const transaction: Transaction = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      hash,
      type,
      status: "pending",
      timestamp: Date.now(),
      amount,
      token,
      description,
      metadata,
    }

    setTransactions(prev => [transaction, ...prev])
    return transaction.id
  }, [])

  // Update transaction status
  const updateTransaction = useCallback((
    id: string,
    updates: Partial<Transaction>
  ) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    )
  }, [])

  // Mark transaction as confirmed
  const confirmTransaction = useCallback((id: string, hash?: string) => {
    updateTransaction(id, {
      status: "confirmed",
      ...(hash && { hash }),
    })
  }, [updateTransaction])

  // Mark transaction as failed
  const failTransaction = useCallback((id: string, error: string) => {
    updateTransaction(id, {
      status: "failed",
      error,
    })
  }, [updateTransaction])

  // Clear all transactions
  const clearHistory = useCallback(() => {
    setTransactions([])
    if (walletAddress) {
      localStorage.removeItem(`${STORAGE_KEY}_${walletAddress}`)
    }
  }, [walletAddress])

  // Filter transactions by type
  const getTransactionsByType = useCallback((type: TransactionType) => {
    return transactions.filter(tx => tx.type === type)
  }, [transactions])

  // Get recent transactions (last N)
  const getRecentTransactions = useCallback((count: number = 10) => {
    return transactions.slice(0, count)
  }, [transactions])

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    confirmTransaction,
    failTransaction,
    clearHistory,
    getTransactionsByType,
    getRecentTransactions,
  }
}
