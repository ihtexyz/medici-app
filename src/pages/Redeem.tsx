import { useEffect, useMemo, useState } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import { useToast } from "../context/ToastContext"
import { getBranches } from "../config/cent"
import { getRedemptionRate, getRedemptionFee, redeemCollateral } from "../services/cent"
import { useCentBalance } from "../hooks/useCentBalance"

/**
 * Redeem Page - Exchange CENT for Collateral
 *
 * Allows users to redeem CENT stablecoin for underlying collateral (BTC wrappers)
 * at current market prices, minus a redemption fee that decreases over time.
 */
export default function Redeem() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { showToast } = useToast()

  const branches = getBranches()
  const [step, setStep] = useState<'amount' | 'preview'>('amount')
  const [centAmount, setCentAmount] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [redemptionRate, setRedemptionRate] = useState<bigint | null>(null)
  const [redemptionFee, setRedemptionFee] = useState<bigint | null>(null)

  const { data: centBalance } = useCentBalance(address || undefined)

  // Fetch redemption rate on mount
  useEffect(() => {
    if (!isConnected) return
    const load = async () => {
      try {
        const { ethers } = await import('ethers')
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const rate = await getRedemptionRate(provider as any)
        setRedemptionRate(rate)
      } catch (e) {
        console.error("Failed to load redemption rate:", e)
      }
    }
    load()
  }, [isConnected])

  // Calculate redemption fee when amount changes
  useEffect(() => {
    if (!centAmount || parseFloat(centAmount) <= 0 || !isConnected) {
      setRedemptionFee(null)
      return
    }

    const load = async () => {
      try {
        const { ethers } = await import('ethers')
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const amt = BigInt(Math.round(parseFloat(centAmount) * 1e18))
        const fee = await getRedemptionFee(provider as any, amt)
        setRedemptionFee(fee)
      } catch (e) {
        console.error("Failed to calculate fee:", e)
        setRedemptionFee(null)
      }
    }
    load()
  }, [centAmount, isConnected])

  const centAmountBigInt = useMemo(() => {
    if (!centAmount || parseFloat(centAmount) <= 0) return 0n
    return BigInt(Math.round(parseFloat(centAmount) * 1e18))
  }, [centAmount])

  const centAfterFee = useMemo(() => {
    if (!centAmountBigInt || !redemptionFee) return 0n
    return centAmountBigInt - redemptionFee
  }, [centAmountBigInt, redemptionFee])

  const redemptionRatePercent = useMemo(() => {
    if (!redemptionRate) return null
    return (Number(redemptionRate) / 1e16).toFixed(2)
  }, [redemptionRate])

  const handlePreview = () => {
    if (!centAmount || parseFloat(centAmount) <= 0) {
      showToast('Please enter a valid amount', 'error')
      return
    }
    if (!redemptionFee) {
      showToast('Calculating fee, please wait...', 'error')
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

      const amt = BigInt(Math.round(parseFloat(centAmount) * 1e18))
      const maxFee = BigInt(Math.round(0.05 * 1e18)) // 5% max fee for safety

      await redeemCollateral(provider as any, amt, maxFee)
      showToast('Redemption successful!', 'success')
      setStep('amount')
      setCentAmount('')
    } catch (error) {
      console.error('Redemption error:', error)
      showToast('Failed to redeem', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Not connected
  if (!isConnected) {
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
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>🔄</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Redeem CENT
        </h2>
        <p className="cb-body" style={{
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Exchange CENT for collateral at market prices
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

  // Step 1: Enter Amount
  if (step === 'amount') {
    return (
      <div style={{
        padding: 'var(--cb-space-lg)',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        <div style={{ marginBottom: 'var(--cb-space-xl)', textAlign: 'center' }}>
          <h1 className="cb-title">Redeem CENT</h1>
          <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
            Exchange CENT for collateral at current market prices
          </p>
        </div>

        {/* Info Card */}
        <div className="cb-card" style={{
          padding: 'var(--cb-space-lg)',
          marginBottom: 'var(--cb-space-lg)',
          background: 'rgba(52, 199, 89, 0.05)',
          border: '1px solid rgba(52, 199, 89, 0.2)',
        }}>
          <h3 className="cb-subtitle" style={{ marginBottom: 8 }}>How Redemption Works</h3>
          <p className="cb-caption" style={{ marginBottom: 8 }}>
            Redemption allows you to exchange CENT for the underlying collateral (BTC wrappers) at face value.
          </p>
          <p className="cb-caption" style={{ marginBottom: 8 }}>
            • You pay a redemption fee: {redemptionRatePercent || '...'}%
          </p>
          <p className="cb-caption">
            • Collateral is taken from Troves with the lowest interest rates first
          </p>
        </div>

        {/* Balance Display */}
        {centBalance !== null && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--cb-space-md)',
          }}>
            <div className="cb-caption">Your CENT Balance:</div>
            <div className="cb-body cb-mono">{(Number(centBalance) / 1e18).toFixed(2)} CENT</div>
          </div>
        )}

        {/* Amount Input */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--cb-space-2xl)',
        }}>
          <div style={{ marginBottom: 'var(--cb-space-md)' }}>
            <input
              type="number"
              value={centAmount}
              onChange={(e) => setCentAmount(e.target.value)}
              placeholder="CENT amount"
              className="amount-input-large"
              autoFocus
            />
          </div>
          <div className="cb-caption">Amount to redeem</div>

          {centBalance && centAmount && parseFloat(centAmount) > 0 && (
            <button
              className="cb-btn cb-btn-tertiary"
              style={{ marginTop: 8 }}
              onClick={() => setCentAmount((Number(centBalance) / 1e18).toString())}
            >
              Max: {(Number(centBalance) / 1e18).toFixed(2)} CENT
            </button>
          )}
        </div>

        {/* Fee Preview */}
        {redemptionFee !== null && centAmountBigInt > 0n && (
          <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-lg)' }}>
            <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Fee Preview</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="cb-caption">Redemption Amount</div>
              <div className="cb-body cb-mono">{parseFloat(centAmount).toFixed(2)} CENT</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="cb-caption">Redemption Fee ({redemptionRatePercent}%)</div>
              <div className="cb-body cb-mono" style={{ color: 'var(--cb-error)' }}>
                -{(Number(redemptionFee) / 1e18).toFixed(4)} CENT
              </div>
            </div>

            <div style={{
              borderTop: '1px solid var(--cb-border)',
              marginTop: 8,
              paddingTop: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="cb-body" style={{ fontWeight: 600 }}>Net Collateral Value</div>
                <div className="cb-body cb-mono" style={{ fontWeight: 600, color: 'var(--cb-success)' }}>
                  ~{(Number(centAfterFee) / 1e18).toFixed(4)} USD
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="cb-card" style={{
          padding: 'var(--cb-space-md)',
          marginBottom: 'var(--cb-space-lg)',
          background: 'rgba(255, 149, 0, 0.05)',
          border: '1px solid rgba(255, 149, 0, 0.2)',
        }}>
          <div className="cb-caption" style={{ color: '#FF9500' }}>
            ⚠️ Redemptions affect Troves with the lowest interest rates first. Consider depositing to the Stability Pool for guaranteed yields instead.
          </div>
        </div>

        {/* Preview Button */}
        <button
          className="cb-btn cb-btn-primary"
          onClick={handlePreview}
          disabled={!centAmount || parseFloat(centAmount) <= 0 || !redemptionFee}
        >
          Preview Redemption
        </button>
      </div>
    )
  }

  // Step 2: Preview & Confirm
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
        <h1 className="cb-title">Confirm Redemption</h1>
      </div>

      {/* Summary Card */}
      <div className="cb-card" style={{ padding: 'var(--cb-space-lg)', marginBottom: 'var(--cb-space-xl)' }}>
        <h3 className="cb-subtitle" style={{ marginBottom: 12 }}>Redemption Summary</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="cb-caption">You Redeem</div>
          <div className="cb-body cb-mono">{parseFloat(centAmount).toFixed(2)} CENT</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="cb-caption">Redemption Fee</div>
          <div className="cb-body cb-mono" style={{ color: 'var(--cb-error)' }}>
            {redemptionFee && (Number(redemptionFee) / 1e18).toFixed(4)} CENT ({redemptionRatePercent}%)
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--cb-border)',
          marginTop: 12,
          paddingTop: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="cb-body" style={{ fontWeight: 600 }}>You Receive (approx)</div>
            <div className="cb-body cb-mono" style={{ fontWeight: 600, color: 'var(--cb-success)' }}>
              ${(Number(centAfterFee) / 1e18).toFixed(4)}
            </div>
          </div>
          <div className="cb-caption" style={{ textAlign: 'right' }}>
            In BTC wrappers ({branches.map(b => b.collSymbol).join(', ')})
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="cb-card" style={{
        padding: 'var(--cb-space-md)',
        marginBottom: 'var(--cb-space-lg)',
        background: 'rgba(94, 92, 230, 0.05)',
        border: '1px solid rgba(94, 92, 230, 0.2)',
      }}>
        <div className="cb-caption">
          ℹ️ The system will automatically redeem from Troves with the lowest interest rates across all collateral types. You may receive a mix of WBTC and cbBTC.
        </div>
      </div>

      {/* Confirm Button */}
      <button
        className="cb-btn cb-btn-primary"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? 'Confirming...' : 'Confirm Redemption'}
      </button>

      <p className="cb-caption" style={{
        textAlign: 'center',
        marginTop: 'var(--cb-space-md)',
      }}>
        By confirming, you agree to exchange your CENT for collateral at the current market rate.
      </p>
    </div>
  )
}
