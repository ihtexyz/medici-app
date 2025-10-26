import { render, screen } from '@testing-library/react'
import TransactionHistory from '../TransactionHistory'
import type { Transaction } from '../../types/transaction'

describe('TransactionHistory', () => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      hash: '0x123',
      type: 'borrow',
      status: 'confirmed',
      timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      amount: '1000',
      token: 'CENT',
      description: 'Borrow 1000 CENT',
    },
    {
      id: '2',
      type: 'swap',
      status: 'pending',
      timestamp: Date.now() - 1000 * 30, // 30 seconds ago
      amount: '0.05',
      token: 'BTC',
      description: 'Swap 0.05 BTC → USDC',
      metadata: {
        fromToken: 'BTC',
        toToken: 'USDC',
      },
    },
    {
      id: '3',
      type: 'deposit',
      status: 'failed',
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      amount: '5000',
      token: 'CENT',
      description: 'Deposit 5000 CENT to stability pool',
      error: 'Insufficient gas',
    },
  ]

  describe('Empty State', () => {
    it('should render empty state when no transactions', () => {
      render(<TransactionHistory transactions={[]} />)

      expect(screen.getByText('No transactions yet')).toBeInTheDocument()
      expect(screen.getByText('📋')).toBeInTheDocument()
    })

    it('should render custom empty message', () => {
      render(
        <TransactionHistory
          transactions={[]}
          emptyMessage="No swaps yet"
        />
      )

      expect(screen.getByText('No swaps yet')).toBeInTheDocument()
    })
  })

  describe('Transaction List', () => {
    it('should render all transactions', () => {
      render(<TransactionHistory transactions={mockTransactions} />)

      expect(screen.getByText('Borrow 1000 CENT')).toBeInTheDocument()
      expect(screen.getByText('Swap 0.05 BTC → USDC')).toBeInTheDocument()
      expect(screen.getByText('Deposit 5000 CENT to stability pool')).toBeInTheDocument()
    })

    it('should display transaction amounts', () => {
      render(<TransactionHistory transactions={mockTransactions} />)

      expect(screen.getByText('1000 CENT')).toBeInTheDocument()
      expect(screen.getByText('0.05 BTC')).toBeInTheDocument()
      expect(screen.getByText('5000 CENT')).toBeInTheDocument()
    })

    it('should show transaction hash for confirmed transactions', () => {
      render(<TransactionHistory transactions={mockTransactions} />)

      // Hash should be truncated: 0x123...0x123
      expect(screen.getByText(/0x123/)).toBeInTheDocument()
    })
  })

  describe('Transaction Status', () => {
    it('should display confirmed status with green color', () => {
      render(<TransactionHistory transactions={[mockTransactions[0]]} />)

      const statusBadge = screen.getByText('Confirmed')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveStyle({ color: 'var(--cb-green)' })
    })

    it('should display pending status with orange color', () => {
      render(<TransactionHistory transactions={[mockTransactions[1]]} />)

      const statusBadge = screen.getByText('Pending')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveStyle({ color: 'var(--cb-orange)' })
    })

    it('should display failed status with red color and error message', () => {
      render(<TransactionHistory transactions={[mockTransactions[2]]} />)

      const statusBadge = screen.getByText('Failed')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveStyle({ color: 'var(--cb-red)' })

      expect(screen.getByText('Insufficient gas')).toBeInTheDocument()
    })
  })

  describe('Transaction Icons', () => {
    const iconTests = [
      { type: 'borrow' as const, icon: '💳' },
      { type: 'repay' as const, icon: '💵' },
      { type: 'deposit' as const, icon: '📥' },
      { type: 'withdraw' as const, icon: '📤' },
      { type: 'swap' as const, icon: '🔄' },
      { type: 'on_ramp' as const, icon: '🏦' },
      { type: 'off_ramp' as const, icon: '💰' },
      { type: 'claim' as const, icon: '🎁' },
    ]

    iconTests.forEach(({ type, icon }) => {
      it(`should display ${icon} icon for ${type} transactions`, () => {
        const transaction: Transaction = {
          id: '1',
          type,
          status: 'confirmed',
          timestamp: Date.now(),
          amount: '100',
          token: 'CENT',
          description: `Test ${type}`,
        }

        render(<TransactionHistory transactions={[transaction]} />)
        expect(screen.getByText(icon)).toBeInTheDocument()
      })
    })
  })

  describe('Timestamps', () => {
    it('should display "Just now" for very recent transactions', () => {
      const recentTransaction: Transaction = {
        id: '1',
        type: 'borrow',
        status: 'confirmed',
        timestamp: Date.now() - 1000, // 1 second ago
        amount: '100',
        token: 'CENT',
        description: 'Recent borrow',
      }

      render(<TransactionHistory transactions={[recentTransaction]} />)
      expect(screen.getByText('Just now')).toBeInTheDocument()
    })

    it('should display minutes ago for recent transactions', () => {
      const transaction: Transaction = {
        id: '1',
        type: 'borrow',
        status: 'confirmed',
        timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
        amount: '100',
        token: 'CENT',
        description: 'Test borrow',
      }

      render(<TransactionHistory transactions={[transaction]} />)
      expect(screen.getByText('5m ago')).toBeInTheDocument()
    })

    it('should display hours ago for older transactions', () => {
      const transaction: Transaction = {
        id: '1',
        type: 'borrow',
        status: 'confirmed',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        amount: '100',
        token: 'CENT',
        description: 'Test borrow',
      }

      render(<TransactionHistory transactions={[transaction]} />)
      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })

    it('should display days ago for very old transactions', () => {
      const transaction: Transaction = {
        id: '1',
        type: 'borrow',
        status: 'confirmed',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
        amount: '100',
        token: 'CENT',
        description: 'Test borrow',
      }

      render(<TransactionHistory transactions={[transaction]} />)
      expect(screen.getByText('3d ago')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading message when loading prop is true', () => {
      render(<TransactionHistory transactions={[]} loading={true} />)

      expect(screen.getByText('Loading transactions...')).toBeInTheDocument()
    })
  })

  describe('Click Handling', () => {
    it('should call onTransactionClick when transaction is clicked', () => {
      const onClickMock = jest.fn()

      render(
        <TransactionHistory
          transactions={[mockTransactions[0]]}
          onTransactionClick={onClickMock}
        />
      )

      const transactionCard = screen.getByText('Borrow 1000 CENT').closest('.cb-card')
      transactionCard?.click()

      expect(onClickMock).toHaveBeenCalledWith(mockTransactions[0])
    })

    it('should not throw error when clicking without onTransactionClick handler', () => {
      render(<TransactionHistory transactions={[mockTransactions[0]]} />)

      const transactionCard = screen.getByText('Borrow 1000 CENT').closest('.cb-card')

      expect(() => {
        transactionCard?.click()
      }).not.toThrow()
    })
  })

  describe('Transaction Ordering', () => {
    it('should display transactions in the order provided', () => {
      render(<TransactionHistory transactions={mockTransactions} />)

      const descriptions = screen.getAllByText(/Borrow|Swap|Deposit/)

      expect(descriptions[0]).toHaveTextContent('Borrow 1000 CENT')
      expect(descriptions[1]).toHaveTextContent('Swap 0.05 BTC → USDC')
      expect(descriptions[2]).toHaveTextContent('Deposit 5000 CENT to stability pool')
    })
  })
})
