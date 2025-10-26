import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import { useToast } from "../context/ToastContext"
import { openTrove, addCollateral, withdrawCollateral, repayCent, withdrawCent, closeTrove, faucetTap } from "../services/cent"
import { getBranches } from "../config/cent"
import { useTrove } from "../hooks/useTrove"

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
  const [selectedCollateral, setSelectedCollateral] = useState<string>('WBTC18')
  const [centAmount, setCentAmount] = useState('')
  const [collAmount, setCollAmount] = useState('')
  const [interestRate, setInterestRate] = useState('5')
  const [loading, setLoading] = useState(false)
  const [manageStatus, setManageStatus] = useState<string | null>(null)
  const [manageCollAmount, setManageCollAmount] = useState("")
  const [manageCentAmount, setManageCentAmount] = useState("")

  const { data: trove } = useTrove(selectedCollateral, address || undefined, 0n)
  const hasTrove = useMemo(() => !!trove && (trove.entireDebt > 0n || trove.entireColl > 0n), [trove])

  const handleSelectCollateral = (symbol: string) => {
    setSelectedCollateral(symbol)
    setStep('amount')
  }

  const handlePreview = () => {
    if (!centAmount || parseFloat(centAmount) <= 0 || !collAmount || parseFloat(collAmount) <= 0) {
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

      const cent = BigInt(Math.round(parseFloat(centAmount) * 1e18))
      const coll = BigInt(Math.round(parseFloat(collAmount) * 1e18))
      const rate = BigInt(Math.round((parseFloat(interestRate) / 100) * 1e18))

      await openTrove(provider as any, {
        collateralSymbol: selectedCollateral,
        owner: address,
        ownerIndex: 0n,
        collAmount: coll,
        centAmount: cent,
        annualInterestRate: rate,
        maxUpfrontFee: BigInt(Math.round(0.02 * 1e18)),
      })
      showToast('Borrow successful!', 'success')
      setStep('select')
      setCentAmount('')
      setCollAmount('')
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
        paddingLeft: 'var(--cb-space-lg)',
        paddingRight: 'var(--cb-space-lg)',
        paddingTop: 'var(--cb-space-2xl)',
        paddingBottom: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center',
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

  // Step 1: Select Collateral
  if (step === 'select') {
    return (
      <div style={{ 
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
          <h1 className="cb-title">Select collateral</h1>
          <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
            Choose a BTC wrapper to collateralize your CENT loan
          </p>
        </div>

        {/* Collateral List from CENT branches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cb-space-sm)' }}>
          {(getBranches() || []).map((b) => (
            <div key={b.collSymbol} className="token-item" onClick={() => handleSelectCollateral(b.collSymbol)}>
              <div className="token-icon" style={{ background: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)' }}>₿</div>
              <div className="token-info">
                <div className="token-name">{b.collSymbol}</div>
                <div className="token-symbol">BTC wrapper</div>
              </div>
              <div className="token-balance">
                <div className="token-amount">—</div>
                <div className="token-value">Select</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--cb-space-xl)' }}>
          <Link
            to="/earn"
            className="cb-btn cb-btn-tertiary"
            style={{ textDecoration: 'none' }}
          >
            Or earn interest instead
          </Link>
        </div>

        {/* Testnet Faucet */}
        <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginTop: 'var(--cb-space-lg)' }}>
          <h3 className="cb-subtitle" style={{ marginBottom: 8 }}>Testnet Faucet</h3>
          <p className="cb-caption" style={{ marginBottom: 12 }}>
            Get testnet tokens for testing. Click to receive 1 {selectedCollateral} and 1000 CENT.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="cb-btn cb-btn-tertiary"
              onClick={async () => {
                try {
                  setManageStatus(null)
                  const { ethers } = await import('ethers')
                  const provider = new ethers.BrowserProvider((window as any).ethereum)
                  await faucetTap(provider as any, selectedCollateral)
                  setManageStatus(`Received 1 ${selectedCollateral}`)
                } catch (e) {
                  setManageStatus(e instanceof Error ? e.message : 'Faucet failed')
                }
              }}
            >
              Get {selectedCollateral}
            </button>
            <button
              className="cb-btn cb-btn-tertiary"
              onClick={async () => {
                try {
                  setManageStatus(null)
                  const { ethers } = await import('ethers')
                  const provider = new ethers.BrowserProvider((window as any).ethereum)
                  await faucetTap(provider as any, 'CENT')
                  setManageStatus('Received 1000 CENT')
                } catch (e) {
                  setManageStatus(e instanceof Error ? e.message : 'CENT faucet failed')
                }
              }}
            >
              Get CENT
            </button>
          </div>
          {manageStatus && <div className="cb-caption" style={{ marginTop: 8 }}>{manageStatus}</div>}
        </div>
      </div>
    )
  }

  // Step 2: Enter Amounts
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
          <h1 className="cb-title">Borrow CENT</h1>
          <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>Enter collateral and CENT amounts</p>
        </div>

        {/* Collateral Amount */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: 'var(--cb-space-2xl)',
        }}>
          <div style={{ marginBottom: 'var(--cb-space-md)' }}>
            <input type="number" value={collAmount} onChange={(e) => setCollAmount(e.target.value)} placeholder="Collateral (18d)" className="amount-input-large" autoFocus />
          </div>
          <div className="cb-caption">Collateral: {selectedCollateral}</div>
        </div>

        {/* CENT Amount */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--cb-space-2xl)' }}>
          <div style={{ marginBottom: 'var(--cb-space-md)' }}>
            <input type="number" value={centAmount} onChange={(e) => setCentAmount(e.target.value)} placeholder="CENT to mint" className="amount-input-large" />
          </div>
          <div className="cb-caption">Stablecoin to borrow</div>
        </div>

        {/* Interest Rate */}
        <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
          <div className="cb-body" style={{ marginBottom: 8, fontWeight: 600 }}>Interest rate</div>
          <input type="range" min="0.5" max="25" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
          <div className="cb-caption" style={{ marginTop: 8 }}>{interestRate}% APR</div>
        </div>

        {/* Preview Button */}
        <button
          className="cb-btn cb-btn-primary"
          onClick={handlePreview}
          disabled={!centAmount || parseFloat(centAmount) <= 0 || !collAmount || parseFloat(collAmount) <= 0}
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
      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="cb-caption">Collateral</div>
          <div className="cb-body">{selectedCollateral}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="cb-caption">Collateral Amount</div>
          <div className="cb-body cb-mono">{collAmount}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="cb-caption">CENT to Mint</div>
          <div className="cb-body cb-mono">{centAmount || '0'}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="cb-caption">Interest Rate</div>
          <div className="cb-body cb-mono">{interestRate}%</div>
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
        By confirming, your BTC wrapper is locked as collateral until repayment.
      </p>

      {hasTrove && (
        <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginTop: 'var(--cb-space-xl)' }}>
          <h3 className="cb-subtitle" style={{ marginBottom: 8 }}>Manage Position</h3>
          <div className="cb-caption" style={{ marginBottom: 6 }}>Collateral ({selectedCollateral})</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="number"
              value={manageCollAmount}
              onChange={(e) => setManageCollAmount(e.target.value)}
              placeholder="0.00"
              style={{ flex: 1 }}
            />
            <button
              className="cb-btn cb-btn-tertiary"
              onClick={async () => {
                try {
                  setManageStatus(null)
                  const { ethers } = await import('ethers')
                  const provider = new ethers.BrowserProvider((window as any).ethereum)
                  const amt = BigInt(Math.round(parseFloat(manageCollAmount || '0') * 1e18))
                  if (amt <= 0n) { setManageStatus('Enter a valid amount'); return }
                  await addCollateral(provider as any, selectedCollateral, 0n, amt)
                  setManageStatus('Collateral added')
                } catch (e) {
                  setManageStatus(e instanceof Error ? e.message : 'Add collateral failed')
                }
              }}
            >Add</button>
            <button
              className="cb-btn cb-btn-tertiary"
              onClick={async () => {
                try {
                  setManageStatus(null)
                  const { ethers } = await import('ethers')
                  const provider = new ethers.BrowserProvider((window as any).ethereum)
                  const amt = BigInt(Math.round(parseFloat(manageCollAmount || '0') * 1e18))
                  if (amt <= 0n) { setManageStatus('Enter a valid amount'); return }
                  await withdrawCollateral(provider as any, selectedCollateral, 0n, amt)
                  setManageStatus('Collateral withdrawn')
                } catch (e) {
                  setManageStatus(e instanceof Error ? e.message : 'Withdraw collateral failed')
                }
              }}
            >Withdraw</button>
          </div>

          <div className="cb-caption" style={{ margin: '12px 0 6px' }}>CENT</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="number"
              value={manageCentAmount}
              onChange={(e) => setManageCentAmount(e.target.value)}
              placeholder="0.00"
              style={{ flex: 1 }}
            />
            <button
              className="cb-btn cb-btn-tertiary"
              onClick={async () => {
                try {
                  setManageStatus(null)
                  const { ethers } = await import('ethers')
                  const provider = new ethers.BrowserProvider((window as any).ethereum)
                  const amt = BigInt(Math.round(parseFloat(manageCentAmount || '0') * 1e18))
                  if (amt <= 0n) { setManageStatus('Enter a valid amount'); return }
                  await withdrawCent(provider as any, selectedCollateral, 0n, amt, BigInt(Math.round(0.02 * 1e18)))
                  setManageStatus('CENT withdrawn')
                } catch (e) {
                  setManageStatus(e instanceof Error ? e.message : 'Withdraw CENT failed')
                }
              }}
            >Borrow more</button>
            <button
              className="cb-btn cb-btn-tertiary"
              onClick={async () => {
                try {
                  setManageStatus(null)
                  const { ethers } = await import('ethers')
                  const provider = new ethers.BrowserProvider((window as any).ethereum)
                  const amt = BigInt(Math.round(parseFloat(manageCentAmount || '0') * 1e18))
                  if (amt <= 0n) { setManageStatus('Enter a valid amount'); return }
                  await repayCent(provider as any, selectedCollateral, 0n, amt)
                  setManageStatus('CENT repaid')
                } catch (e) {
                  setManageStatus(e instanceof Error ? e.message : 'Repay failed')
                }
              }}
            >Repay</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <button
              className="cb-btn cb-btn-tertiary"
              onClick={async () => {
                try {
                  setManageStatus(null)
                  const { ethers } = await import('ethers')
                  const provider = new ethers.BrowserProvider((window as any).ethereum)
                  await closeTrove(provider as any, selectedCollateral, 0n)
                  setManageStatus('Position closed')
                } catch (e) {
                  setManageStatus(e instanceof Error ? e.message : 'Close failed')
                }
              }}
            >Close Position</button>
            {manageStatus && <div className="cb-caption">{manageStatus}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
