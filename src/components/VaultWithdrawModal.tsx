import { useState, useEffect } from 'react'
import { type VaultConfig } from '../config/vaults'
import { useVault } from '../hooks/useVault'

interface VaultWithdrawModalProps {
  vault: VaultConfig
  onClose: () => void
  onSuccess: () => void
}

export default function VaultWithdrawModal({ vault, onClose, onSuccess }: VaultWithdrawModalProps) {
  const [shares, setShares] = useState('')
  const [vaultShares, setVaultShares] = useState('0')

  const {
    loading,
    step,
    txHash,
    error,
    getVaultShares,
    withdraw,
    reset,
  } = useVault(vault.address as `0x${string}`, vault.asset as `0x${string}`)

  // Load shares on mount
  useEffect(() => {
    async function loadShares() {
      const sharesBalance = await getVaultShares()
      setVaultShares(sharesBalance)
    }
    loadShares()
  }, [getVaultShares])

  const handleWithdraw = async () => {
    if (!shares) return
    const success = await withdraw(shares)
    if (success) {
      onSuccess()
      setTimeout(onClose, 2000) // Auto-close after 2s
    }
  }

  const handleMax = () => {
    setShares(vaultShares)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-md)',
      }}
      onClick={handleClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: 'var(--space-2xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <h2 className="text-2xl">Withdraw {vault.assetSymbol}</h2>
          <button className="btn-icon" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <label className="label">Shares to Redeem</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              className="input"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder={`0.0 ${vault.symbol}`}
              disabled={loading}
              style={{ paddingRight: '80px' }}
            />
            <button
              className="btn btn-sm"
              onClick={handleMax}
              disabled={loading}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              MAX
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-sm)' }}>
            <span className="text-sm text-secondary">Your Shares: {parseFloat(vaultShares).toFixed(6)} {vault.symbol}</span>
          </div>
        </div>

        {/* Info */}
        <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-xl)', background: 'var(--surface-secondary)' }}>
          <h4 className="text-sm" style={{ marginBottom: 'var(--space-sm)', fontWeight: 600 }}>Withdrawal Info</h4>
          <p className="text-sm text-secondary">
            Withdrawing shares will redeem them for the underlying {vault.assetSymbol} assets. The amount you receive depends on the current share price.
          </p>
          <p className="text-sm text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
            No lock-up period. You can withdraw anytime.
          </p>
        </div>

        {/* Transaction Steps */}
        {step !== 'idle' && (
          <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-xl)', background: 'var(--surface-secondary)' }}>
            <h4 className="text-sm" style={{ marginBottom: 'var(--space-md)', fontWeight: 600 }}>Transaction Progress</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div className={`status-dot status-${step === 'depositing' ? 'active' : step === 'deposited' ? 'complete' : 'pending'}`} />
              <span className="text-sm">Redeem shares</span>
            </div>

            {txHash && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <a
                  href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm"
                  style={{ color: 'var(--primary)' }}
                >
                  View on Arbiscan →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button
            className="btn btn-primary"
            onClick={handleWithdraw}
            disabled={loading || !shares || parseFloat(shares) === 0 || parseFloat(shares) > parseFloat(vaultShares) || step === 'deposited'}
            style={{ flex: 1 }}
          >
            {loading && step === 'depositing' ? 'Withdrawing...' : step === 'deposited' ? 'Withdrawn!' : 'Withdraw'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={loading && step !== 'idle'}
            style={{ flex: 1 }}
          >
            {step === 'deposited' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}

