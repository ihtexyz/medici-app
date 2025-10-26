import { useState, useEffect } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import { useToast } from "../context/ToastContext"
import { useSwapKit } from "../state/swapkit"
import { getQuote, executeSwap } from "../services/swapkit"
import { useTransactionHistory } from "../hooks/useTransactionHistory"
import TransactionHistory from "../components/TransactionHistory"

/**
 * Swap/Convert Page - Coinbase Convert Style
 * Matches Figma 218-259 design
 * 
 * Flow:
 * 1. Select tokens (from/to)
 * 2. Enter amount
 * 3. Preview with rate
 * 4. Confirm swap
 */
export default function Swap() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { showToast } = useToast()
  const { error: swapkitError } = useSwapKit()
  const { transactions, addTransaction, confirmTransaction, failTransaction, getTransactionsByType } = useTransactionHistory(address)

  const [step, setStep] = useState<'select' | 'amount' | 'preview' | 'confirm'>('amount')
  const [fromToken, setFromToken] = useState('BTC')
  const [toToken, setToToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)

  // Fetch quote when amount changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && address) {
      const timer = setTimeout(async () => {
        try {
          const quoteResult = await getQuote({
            fromChain: 'btc',
            toChain: 'arb',
            amount: parseFloat(amount),
            fromTokenSymbol: fromToken as any,
            toTokenSymbol: toToken as any,
          })
          setQuote({
            expectedAmount: quoteResult.estimatedOut,
            rate: quoteResult.estimatedOut / parseFloat(amount),
          })
        } catch (error) {
          console.error('Quote error:', error)
        }
      }, 500) // Debounce

      return () => clearTimeout(timer)
    }
  }, [amount, fromToken, toToken, address])

  const handleSwap = () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error')
      return
    }
    setStep('preview')
  }

  const handleConfirm = async () => {
    if (!address) {
      showToast('Please connect your wallet', 'error')
      return
    }

    setLoading(true)
    setStep('confirm')
    const txId = addTransaction("swap", amount, fromToken, `Swap ${amount} ${fromToken} → ${toToken}`)

    try {
      // Get fresh quote
      const quoteResult = await getQuote({
        fromChain: 'btc',
        toChain: 'arb',
        amount: parseFloat(amount),
        fromTokenSymbol: fromToken as any,
        toTokenSymbol: toToken as any,
      })

      // Execute swap with quote
      await executeSwap(quoteResult, address, address)
      confirmTransaction(txId)
      showToast('Swap completed successfully!', 'success')

      // Reset after success
      setTimeout(() => {
        setStep('amount')
        setAmount('')
        setQuote(null)
      }, 2000)
    } catch (error) {
      console.error('Swap error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Swap failed'
      failTransaction(txId, errorMsg)
      showToast('Swap failed', 'error')
      setStep('preview')
    } finally {
      setLoading(false)
    }
  }

  const swapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setQuote(null)
  }

  // Not connected
  if (!isConnected) {
    return (
      <div style={{ 
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: 'var(--cb-space-2xl)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>🔄</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Connect to convert
        </h2>
        <p className="cb-body" style={{ 
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to swap tokens across multiple chains
        </p>
        <button
          className="cb-btn cb-btn-primary"
          onClick={() => open()}
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  // Confirmation Screen
  if (step === 'confirm') {
    return (
      <div style={{ 
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: 'var(--cb-space-2xl)',
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #32D74B 0%, #30D158 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--cb-space-xl)',
          fontSize: '60px',
        }}>
          ✓
        </div>

        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Confirmation
        </h2>

        <div className="balance-medium" style={{ color: 'var(--cb-text-primary)', marginBottom: 'var(--cb-space-sm)' }}>
          You sent ${parseFloat(amount).toFixed(2)}
        </div>
        <div className="cb-body" style={{ color: 'var(--cb-text-primary)', marginBottom: 'var(--cb-space-xs)' }}>
          {amount} {fromToken}
        </div>
        <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xl)' }}>
          To: {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Unknown'}
        </div>

        <p className="cb-caption" style={{ marginBottom: 'var(--cb-space-lg)' }}>
          This transaction usually takes less than 5 minutes
        </p>

        <div style={{ display: 'flex', gap: 'var(--cb-space-md)' }}>
          <button
            className="cb-btn cb-btn-tertiary"
            style={{ flex: 1 }}
          >
            Show details
          </button>
          <button
            className="cb-btn cb-btn-primary"
            onClick={() => {
              setStep('amount')
              setAmount('')
            }}
            style={{ flex: 1 }}
          >
            Done
          </button>
        </div>

        <button
          className="cb-btn cb-btn-tertiary"
          onClick={() => {
            setStep('amount')
            setAmount('')
          }}
          style={{ marginTop: 'var(--cb-space-md)' }}
        >
          New transaction
        </button>
      </div>
    )
  }

  // Preview Screen
  if (step === 'preview') {
    const estimatedReceive = quote?.expectedAmount || (parseFloat(amount) * 1.0)
    const rate = quote?.rate || 1.0
    
    return (
      <div style={{ 
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {/* Back Button */}
        <button
          onClick={() => setStep('amount')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--cb-text-secondary)',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: 'var(--cb-space-lg)',
            padding: 0,
          }}
        >
          ← Back
        </button>

        <div style={{ marginBottom: 'var(--cb-space-xl)', textAlign: 'center' }}>
          <h1 className="cb-title">Order preview</h1>
        </div>

        {/* Amount Display */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          <div className="balance-medium" style={{ color: 'var(--cb-orange)' }}>
            ${parseFloat(amount).toFixed(2)}
          </div>
          <div className="cb-caption">
            {parseFloat(amount).toFixed(6)} {fromToken}
          </div>
        </div>

        {/* Order Details Card */}
        <div className="cb-card" style={{ marginBottom: 'var(--cb-space-xl)' }}>
          <div style={{ marginBottom: 'var(--cb-space-md)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--cb-space-sm)',
            }}>
              <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
                Pay with
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-sm)' }}>
                <span className="cb-body-sm">{fromToken}</span>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                }}>
                  ₿
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--cb-space-sm)',
            }}>
              <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
                To
              </span>
              <span className="cb-body-sm cb-mono">
                {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Unknown'}
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
                Network
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-xs)' }}>
                <span className="cb-body-sm">{toToken}</span>
                <span style={{ fontSize: '18px' }}>$</span>
              </div>
            </div>
          </div>

          <div className="cb-divider"></div>

          <div style={{ marginTop: 'var(--cb-space-md)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: 'var(--cb-space-sm)',
            }}>
              <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
                Exchange rate
              </span>
              <span className="cb-body-sm" style={{ fontWeight: 600 }}>
                1 {fromToken} = {rate.toFixed(2)} {toToken}
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: 'var(--cb-space-sm)',
            }}>
              <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
                Network fee
              </span>
              <span className="cb-body-sm" style={{ fontWeight: 600 }}>$2.10</span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
            }}>
              <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
                Total cost
              </span>
              <span className="cb-body-sm" style={{ fontWeight: 600 }}>
                {parseFloat(amount).toFixed(6)} {fromToken} ≈ ${(parseFloat(amount) + 2.10).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          className="cb-btn cb-btn-primary"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm'}
        </button>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--cb-space-xs)',
          marginTop: 'var(--cb-space-lg)',
        }}>
          <span style={{ fontSize: '16px' }}>🔒</span>
          <span className="cb-caption">Secured by Medici</span>
        </div>

        <p className="cb-caption" style={{ 
          textAlign: 'center',
          marginTop: 'var(--cb-space-sm)',
        }}>
          Sending funds is a permanent action. Verify the account address before confirming.
        </p>
      </div>
    )
  }

  // Amount Entry Screen (Default)
  return (
    <div style={{ 
      padding: 'var(--cb-space-lg)',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      {swapkitError && (
        <div className="cb-card" style={{
          marginBottom: 'var(--cb-space-md)',
          border: '1px solid var(--color-warning)',
          background: 'var(--color-warning-bg)'
        }}>
          <div className="cb-body-sm" style={{ color: 'var(--color-warning)' }}>
            ⚠ Swaps are in mock mode: {swapkitError}
          </div>
          <div className="cb-caption" style={{ marginTop: 4, opacity: 0.9 }}>
            Add VITE_SWAPKIT_API_KEY and VITE_SWAPKIT_PROJECT_ID to enable live quotes.
          </div>
        </div>
      )}
      <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <h1 className="cb-title">Convert</h1>
        <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
          Swap tokens at the best rates
        </p>
      </div>

      {/* From Token */}
      <div className="cb-card" style={{ marginBottom: 'var(--cb-space-md)' }}>
        <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>
          From
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-md)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>
            ₿
          </div>
          <div style={{ flex: 1 }}>
            <div className="cb-body" style={{ fontWeight: 600 }}>{fromToken}</div>
            <div className="cb-caption">Bitcoin</div>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--cb-text-primary)',
              fontSize: '24px',
              fontWeight: 600,
              textAlign: 'right',
              width: '120px',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ 
          textAlign: 'right',
          marginTop: 'var(--cb-space-sm)',
        }}>
          <span className="cb-caption">≈ ${amount ? (parseFloat(amount) * 67500).toFixed(2) : '0.00'}</span>
        </div>
      </div>

      {/* Swap Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        margin: 'calc(var(--cb-space-md) * -1) 0',
        position: 'relative',
        zIndex: 1,
      }}>
        <button
          onClick={swapTokens}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--cb-gray-1)',
            border: '2px solid var(--cb-black)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          ⇅
        </button>
      </div>

      {/* To Token */}
      <div className="cb-card" style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>
          To
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-md)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0A84FF 0%, #5AC8FA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>
            $
          </div>
          <div style={{ flex: 1 }}>
            <div className="cb-body" style={{ fontWeight: 600 }}>{toToken}</div>
            <div className="cb-caption">USD Coin</div>
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--cb-text-primary)',
          }}>
            {quote ? quote.expectedAmount.toFixed(2) : '0.00'}
          </div>
        </div>
        {quote && (
          <div style={{ 
            textAlign: 'right',
            marginTop: 'var(--cb-space-sm)',
          }}>
            <span className="cb-caption">1 {fromToken} = {quote.rate.toFixed(2)} {toToken}</span>
          </div>
        )}
      </div>

      {/* Preview Button */}
      <button
        className="cb-btn cb-btn-primary"
        onClick={handleSwap}
        disabled={!amount || parseFloat(amount) <= 0 || loading}
      >
        Preview send
      </button>

      {/* Info */}
      <div className="cb-card" style={{
        marginTop: 'var(--cb-space-lg)',
        background: 'var(--cb-gray-1)',
      }}>
        <p className="cb-caption">
          💡 Network fees apply. Rate locked for 60 seconds after preview.
        </p>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div style={{ marginTop: 'var(--cb-space-xl)' }}>
          <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
            Recent Swaps
          </h2>
          <TransactionHistory
            transactions={getTransactionsByType("swap").slice(0, 5)}
            emptyMessage="No swaps yet"
          />
        </div>
      )}
    </div>
  )
}
