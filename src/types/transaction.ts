/**
 * Transaction types for Medici app
 */

export type TransactionType =
  | "borrow" // Open trove / borrow CENT
  | "repay" // Repay CENT debt
  | "deposit" // Deposit to stability pool
  | "withdraw" // Withdraw from stability pool
  | "claim" // Claim gains from stability pool
  | "swap" // Cross-chain swap
  | "bank_account" // Create bank account
  | "bank_card" // Create bank card
  | "bank_deposit" // Deposit to bank account
  | "bank_withdraw" // Withdraw from bank account
  | "on_ramp" // USD → CENT
  | "off_ramp" // CENT → USD
  | "send" // Send money
  | "receive" // Receive money

export type TransactionStatus = "pending" | "confirmed" | "failed"

export interface Transaction {
  id: string // Unique transaction ID
  hash?: string // Blockchain transaction hash
  type: TransactionType
  status: TransactionStatus
  timestamp: number // Unix timestamp
  amount: string // Amount in human-readable format
  token: string // Token symbol (CENT, WBTC, USD, etc.)
  from?: string // From address/account
  to?: string // To address/account
  description: string // Human-readable description
  error?: string // Error message if failed
  metadata?: Record<string, any> // Additional data
}

export interface TransactionHistoryProps {
  transactions: Transaction[]
  loading?: boolean
  emptyMessage?: string
  onTransactionClick?: (transaction: Transaction) => void
}
