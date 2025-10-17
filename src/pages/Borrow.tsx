import { useState } from "react"
import { Link } from "react-router-dom"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import { useToast } from "../context/ToastContext"
import { submitBorrowIntent } from "../services/execution"

/**
 * Borrow Page - Coinbase Buy Style
 * Simplified flow:
 * 1. Select asset to borrow (CENT/USDC)
 * 2. Enter amount
 * 3. Preview order
 * 4. Confirm
 */
export default function Borrow() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { showToast } = useToast()

  const [step, setStep] = useState<'select' | 'amount' | 'preview'>('select')
  const [selectedAsset, setSelectedAsset] = useState<'CENT' | 'BTC'>('CENT')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelectAsset = (asset: 'CENT' | 'BTC') => {
    setSelectedAsset(asset)
    setStep('amount')
  }

  const handlePreview = () => {
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
    try {
      const { ethers } = await import('ethers')
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      
      const amountUSD = parseFloat(amount)
      const collateralBTC = (amountUSD * 1.5) / 67500 // 150% collateral at $67,500/BTC
      const intent = {
        amountUSD: amountUSD,
        aprBps: 1200, // 12% APR
        durationSeconds: 365 * 24 * 60 * 60, // 1 year
        collateralAsset: 'BTC',
        collateralAmount: BigInt(Math.floor(collateralBTC * 1e8)), // BTC has 8 decimals
      }
      
      await submitBorrowIntent(provider, intent)
      showToast('Borrow request submitted successfully!', 'success')
      setStep('select')
      setAmount('')
    } catch (error) {
      console.error('Borrow error:', error)
      showToast('Failed to submit borrow request', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Not connected
  if (!address) {
    return (
      <div style={{ 
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: 'var(--cb-space-2xl)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>🔒</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Connect your wallet
        </h2>
        <p className="cb-body" style={{ 
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to borrow CENT using Bitcoin as collateral
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

  // Step 1: Select Asset
  if (step === 'select') {
    return (
      <div style={{ 
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
          <h1 className="cb-title">Select asset to borrow</h1>
          <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
            Borrow using Bitcoin as collateral
          </p>
        </div>

        {/* Asset List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-sm)' }}>
          <div 
            className="token-item"
            onClick={() => handleSelectAsset('CENT')}
          >
            <div className="token-icon" style={{ 
              background: 'linear-gradient(135deg, #0A84FF 0%, #5AC8FA 100%)',
            }}>
              $
            </div>
            <div className="token-info">
              <div className="token-name">CENT</div>
              <div className="token-symbol">Stablecoin</div>
            </div>
            <div className="token-balance">
              <div className="token-amount">$1.00</div>
              <div className="token-value">1:1 USD</div>
            </div>
          </div>

          <div 
            className="token-item"
            onClick={() => handleSelectAsset('BTC')}
          >
            <div className="token-icon" style={{ 
              background: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)',
            }}>
              ₿
            </div>
            <div className="token-info">
              <div className="token-name">Bitcoin</div>
              <div className="token-symbol">BTC</div>
            </div>
            <div className="token-balance">
              <div className="token-amount">$67,500</div>
              <div className="token-value text-success">+2.5%</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--cb-space-xl)' }}>
          <Link 
            to="/invest" 
            className="cb-btn cb-btn-tertiary"
            style={{ textDecoration: 'none' }}
          >
            Or earn interest instead
          </Link>
        </div>
      </div>
    )
  }

  // Step 2: Enter Amount
  if (step === 'amount') {
    return (
      <div style={{ 
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {/* Back Button */}
        <button
          onClick={() => setStep('select')}
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
          <h1 className="cb-title">Borrow {selectedAsset}</h1>
          <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
            How much would you like to borrow?
          </p>
        </div>

        {/* Amount Input */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: 'var(--cb-space-2xl)',
        }}>
          <div style={{ marginBottom: 'var(--cb-space-md)' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="amount-input-large"
              autoFocus
            />
          </div>
          <div className="cb-caption">
            Collateral: Bitcoin • 150% ratio required
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--cb-space-sm)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          {['100', '500', '1000'].map((val) => (
            <button
              key={val}
              className="cb-btn cb-btn-tertiary"
              onClick={() => setAmount(val)}
            >
              ${val}
            </button>
          ))}
        </div>

        {/* Preview Button */}
        <button
          className="cb-btn cb-btn-primary"
          onClick={handlePreview}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Preview borrow
        </button>
      </div>
    )
  }

  // Step 3: Preview
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
          ${amount}
        </div>
        <div className="cb-caption">
          {parseFloat(amount).toFixed(4)} {selectedAsset}
        </div>
      </div>

      {/* Order Details */}
      <div className="cb-card" style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <div style={{ marginBottom: 'var(--cb-space-md)' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: 'var(--cb-space-sm)',
          }}>
            <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
              To
            </span>
            <span className="cb-body-sm cb-mono">
              {address.slice(0, 10)}...{address.slice(-8)}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: 'var(--cb-space-sm)',
          }}>
            <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
              Network
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-xs)' }}>
              <span className="cb-body-sm">Bitcoin</span>
              <span style={{ fontSize: '18px' }}>₿</span>
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
              Borrow APR
            </span>
            <span className="cb-body-sm" style={{ fontWeight: 600 }}>12.00%</span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: 'var(--cb-space-sm)',
          }}>
            <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
              Collateral required
            </span>
            <span className="cb-body-sm" style={{ fontWeight: 600 }}>
              {(parseFloat(amount) * 1.5 / 67500).toFixed(6)} BTC
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
          }}>
            <span className="cb-body-sm" style={{ color: 'var(--cb-text-secondary)' }}>
              Loan term
            </span>
            <span className="cb-body-sm" style={{ fontWeight: 600 }}>365 days</span>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        className="cb-btn cb-btn-primary"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? 'Confirming...' : 'Confirm borrow'}
      </button>

      <p className="cb-caption" style={{ 
        textAlign: 'center',
        marginTop: 'var(--cb-space-md)',
      }}>
        By confirming, you agree to the loan terms. Your BTC will be locked as collateral until repayment.
      </p>
    </div>
  )
}
