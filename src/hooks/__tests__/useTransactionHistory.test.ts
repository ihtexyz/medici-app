import { renderHook, act } from '@testing-library/react'
import { useTransactionHistory } from '../useTransactionHistory'
import type { TransactionType } from '../../types/transaction'

describe('useTransactionHistory', () => {
  const mockWalletAddress = '0x1234567890abcdef1234567890abcdef12345678'

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with empty transactions when no wallet address', () => {
      const { result } = renderHook(() => useTransactionHistory())

      expect(result.current.transactions).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('should initialize with empty transactions for new wallet', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      expect(result.current.transactions).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('should load transactions from localStorage for existing wallet', () => {
      const existingTransactions = [
        {
          id: '1',
          type: 'borrow' as TransactionType,
          status: 'confirmed' as const,
          timestamp: Date.now(),
          amount: '1000',
          token: 'CENT',
          description: 'Test transaction',
        },
      ]

      localStorage.setItem(
        `medici_transaction_history_${mockWalletAddress}`,
        JSON.stringify(existingTransactions)
      )

      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      expect(result.current.transactions).toHaveLength(1)
      expect(result.current.transactions[0].description).toBe('Test transaction')
    })
  })

  describe('addTransaction', () => {
    it('should add a new transaction', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      let transactionId: string = ''

      act(() => {
        transactionId = result.current.addTransaction(
          'borrow',
          '1000',
          'CENT',
          'Borrow 1000 CENT'
        )
      })

      expect(result.current.transactions).toHaveLength(1)
      expect(result.current.transactions[0]).toMatchObject({
        id: transactionId,
        type: 'borrow',
        status: 'pending',
        amount: '1000',
        token: 'CENT',
        description: 'Borrow 1000 CENT',
      })
    })

    it('should add transaction with hash and metadata', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      const metadata = { fromToken: 'BTC', toToken: 'USDC' }

      act(() => {
        result.current.addTransaction(
          'swap',
          '0.05',
          'BTC',
          'Swap BTC to USDC',
          '0xabc123',
          metadata
        )
      })

      expect(result.current.transactions[0]).toMatchObject({
        hash: '0xabc123',
        metadata,
      })
    })

    it('should add new transactions to the beginning of the list', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      act(() => {
        result.current.addTransaction('borrow', '1000', 'CENT', 'First transaction')
      })

      act(() => {
        result.current.addTransaction('deposit', '2000', 'CENT', 'Second transaction')
      })

      expect(result.current.transactions).toHaveLength(2)
      expect(result.current.transactions[0].description).toBe('Second transaction')
      expect(result.current.transactions[1].description).toBe('First transaction')
    })

    it('should limit transactions to 100', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      act(() => {
        // Add 150 transactions
        for (let i = 0; i < 150; i++) {
          result.current.addTransaction('borrow', '100', 'CENT', `Transaction ${i}`)
        }
      })

      // Should only keep the most recent 100
      expect(result.current.transactions).toHaveLength(100)
      expect(result.current.transactions[0].description).toBe('Transaction 149')
      expect(result.current.transactions[99].description).toBe('Transaction 50')
    })

    it('should generate unique IDs for each transaction', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      let id1: string, id2: string

      act(() => {
        id1 = result.current.addTransaction('borrow', '1000', 'CENT', 'Transaction 1')
        id2 = result.current.addTransaction('borrow', '1000', 'CENT', 'Transaction 2')
      })

      expect(id1).not.toBe(id2)
    })
  })

  describe('updateTransaction', () => {
    it('should update an existing transaction', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      let transactionId: string

      act(() => {
        transactionId = result.current.addTransaction(
          'borrow',
          '1000',
          'CENT',
          'Borrow 1000 CENT'
        )
      })

      act(() => {
        result.current.updateTransaction(transactionId, {
          amount: '2000',
          description: 'Borrow 2000 CENT',
        })
      })

      expect(result.current.transactions[0]).toMatchObject({
        amount: '2000',
        description: 'Borrow 2000 CENT',
      })
    })

    it('should not throw error for non-existent transaction ID', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      expect(() => {
        act(() => {
          result.current.updateTransaction('non-existent-id', { amount: '500' })
        })
      }).not.toThrow()
    })
  })

  describe('confirmTransaction', () => {
    it('should mark transaction as confirmed', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      let transactionId: string

      act(() => {
        transactionId = result.current.addTransaction(
          'borrow',
          '1000',
          'CENT',
          'Borrow 1000 CENT'
        )
      })

      act(() => {
        result.current.confirmTransaction(transactionId)
      })

      expect(result.current.transactions[0].status).toBe('confirmed')
    })

    it('should set transaction hash when confirming', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      let transactionId: string

      act(() => {
        transactionId = result.current.addTransaction(
          'borrow',
          '1000',
          'CENT',
          'Borrow 1000 CENT'
        )
      })

      act(() => {
        result.current.confirmTransaction(transactionId, '0xabc123')
      })

      expect(result.current.transactions[0]).toMatchObject({
        status: 'confirmed',
        hash: '0xabc123',
      })
    })
  })

  describe('failTransaction', () => {
    it('should mark transaction as failed', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      let transactionId: string

      act(() => {
        transactionId = result.current.addTransaction(
          'borrow',
          '1000',
          'CENT',
          'Borrow 1000 CENT'
        )
      })

      act(() => {
        result.current.failTransaction(transactionId, 'Insufficient funds')
      })

      expect(result.current.transactions[0]).toMatchObject({
        status: 'failed',
        error: 'Insufficient funds',
      })
    })

    it('should work without error message', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      let transactionId: string

      act(() => {
        transactionId = result.current.addTransaction(
          'borrow',
          '1000',
          'CENT',
          'Borrow 1000 CENT'
        )
      })

      act(() => {
        result.current.failTransaction(transactionId)
      })

      expect(result.current.transactions[0].status).toBe('failed')
      expect(result.current.transactions[0].error).toBeUndefined()
    })
  })

  describe('clearHistory', () => {
    it('should clear all transactions', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      act(() => {
        result.current.addTransaction('borrow', '1000', 'CENT', 'Transaction 1')
        result.current.addTransaction('deposit', '2000', 'CENT', 'Transaction 2')
      })

      expect(result.current.transactions).toHaveLength(2)

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.transactions).toHaveLength(0)
    })

    it('should remove transactions from localStorage', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      act(() => {
        result.current.addTransaction('borrow', '1000', 'CENT', 'Transaction 1')
      })

      act(() => {
        result.current.clearHistory()
      })

      const stored = localStorage.getItem(`medici_transaction_history_${mockWalletAddress}`)
      expect(stored).toBe('[]')
    })
  })

  describe('getTransactionsByType', () => {
    it('should filter transactions by type', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      act(() => {
        result.current.addTransaction('borrow', '1000', 'CENT', 'Borrow 1')
        result.current.addTransaction('swap', '0.05', 'BTC', 'Swap 1')
        result.current.addTransaction('borrow', '2000', 'CENT', 'Borrow 2')
        result.current.addTransaction('deposit', '3000', 'CENT', 'Deposit 1')
      })

      const borrowTransactions = result.current.getTransactionsByType('borrow')

      expect(borrowTransactions).toHaveLength(2)
      expect(borrowTransactions[0].description).toBe('Borrow 2')
      expect(borrowTransactions[1].description).toBe('Borrow 1')
    })

    it('should return empty array for type with no transactions', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      act(() => {
        result.current.addTransaction('borrow', '1000', 'CENT', 'Borrow 1')
      })

      const swapTransactions = result.current.getTransactionsByType('swap')

      expect(swapTransactions).toEqual([])
    })
  })

  describe('getRecentTransactions', () => {
    it('should return most recent N transactions', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addTransaction('borrow', '100', 'CENT', `Transaction ${i}`)
        }
      })

      const recent = result.current.getRecentTransactions(5)

      expect(recent).toHaveLength(5)
      expect(recent[0].description).toBe('Transaction 9')
      expect(recent[4].description).toBe('Transaction 5')
    })

    it('should return all transactions if count exceeds total', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      act(() => {
        result.current.addTransaction('borrow', '1000', 'CENT', 'Transaction 1')
        result.current.addTransaction('deposit', '2000', 'CENT', 'Transaction 2')
      })

      const recent = result.current.getRecentTransactions(10)

      expect(recent).toHaveLength(2)
    })
  })

  describe('localStorage Persistence', () => {
    it('should save transactions to localStorage on add', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      act(() => {
        result.current.addTransaction('borrow', '1000', 'CENT', 'Test transaction')
      })

      const stored = localStorage.getItem(`medici_transaction_history_${mockWalletAddress}`)
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].description).toBe('Test transaction')
    })

    it('should save transactions to localStorage on update', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      let transactionId: string

      act(() => {
        transactionId = result.current.addTransaction('borrow', '1000', 'CENT', 'Test')
      })

      act(() => {
        result.current.updateTransaction(transactionId, { amount: '2000' })
      })

      const stored = localStorage.getItem(`medici_transaction_history_${mockWalletAddress}`)
      const parsed = JSON.parse(stored!)
      expect(parsed[0].amount).toBe('2000')
    })

    it('should not save when wallet address is undefined', () => {
      const { result } = renderHook(() => useTransactionHistory())

      act(() => {
        result.current.addTransaction('borrow', '1000', 'CENT', 'Test transaction')
      })

      // No wallet-specific key should be created
      const keys = Object.keys(localStorage)
      expect(keys.some(key => key.includes('medici_transaction_history'))).toBe(false)
    })
  })

  describe('Wallet Address Changes', () => {
    it('should load different transactions when wallet address changes', () => {
      const wallet1 = '0x1111111111111111111111111111111111111111'
      const wallet2 = '0x2222222222222222222222222222222222222222'

      // Add transaction for wallet1
      localStorage.setItem(
        `medici_transaction_history_${wallet1}`,
        JSON.stringify([
          {
            id: '1',
            type: 'borrow',
            status: 'confirmed',
            timestamp: Date.now(),
            amount: '1000',
            token: 'CENT',
            description: 'Wallet 1 transaction',
          },
        ])
      )

      // Add transaction for wallet2
      localStorage.setItem(
        `medici_transaction_history_${wallet2}`,
        JSON.stringify([
          {
            id: '2',
            type: 'deposit',
            status: 'confirmed',
            timestamp: Date.now(),
            amount: '2000',
            token: 'CENT',
            description: 'Wallet 2 transaction',
          },
        ])
      )

      const { result, rerender } = renderHook(
        ({ address }) => useTransactionHistory(address),
        { initialProps: { address: wallet1 } }
      )

      expect(result.current.transactions[0].description).toBe('Wallet 1 transaction')

      rerender({ address: wallet2 })

      expect(result.current.transactions[0].description).toBe('Wallet 2 transaction')
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(
        `medici_transaction_history_${mockWalletAddress}`,
        'invalid json{['
      )

      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      // Should fall back to empty array
      expect(result.current.transactions).toEqual([])
    })

    it('should handle localStorage quota exceeded', () => {
      const { result } = renderHook(() => useTransactionHistory(mockWalletAddress))

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError')
      })

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.addTransaction('borrow', '1000', 'CENT', 'Test')
        })
      }).not.toThrow()

      // Restore original implementation
      localStorage.setItem = originalSetItem
    })
  })
})
