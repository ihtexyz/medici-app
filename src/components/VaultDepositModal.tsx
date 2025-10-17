import { useState, useEffect } from 'react'
import { type VaultConfig } from '../config/vaults'
import { useVault, type TransactionStep } from '../hooks/useVault'
import LoadingState from './LoadingState'

interface VaultDepositModalProps {
  vault: VaultConfig
  onClose: () => void
  onSuccess: () => void
}

export default function VaultDepositModal({ vault, onClose, onSuccess }: VaultDepositModalProps) {
  const [amount, setAmount] = useState('')
  const [assetBalance, setAssetBalance] = useState('0')
  const [needsApproval, setNeedsApproval] = useState(false)

  const {
    loading,
    step,
    txHash,
    error,
    getAssetBalance,
    getAllowance,
    approve,
    deposit,
    reset,
  } = useVault(vault.address as `0x${string}`, vault.asset as `0x${string}`)

  // Load balance on mount
  useEffect(() => {
    async function loadBalance() {
      const balance = await getAssetBalance()
      setAssetBalance(balance)
    }
    loadBalance()
  }, [getAssetBalance])

  // Check if approval is needed when amount changes
  useEffect(() => {
    async function checkApproval() {
      if (!amount || parseFloat(amount) === 0) {
        setNeedsApproval(false)
        return
      }

      try {
        const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10 ** vault.assetDecimals))
        const allowance = await getAllowance()
        setNeedsApproval(allowance < amountBigInt)
      } catch {
        setNeedsApproval(true)
      }
    }
    checkApproval()
  }, [amount, vault.assetDecimals, getAllowance])

  const handleApprove = async () => {
    if (!amount) return
    const success = await approve(amount, vault.assetDecimals)
    if (success) {
      setNeedsApproval(false)
    }
  }

  const handleDeposit = async () => {
    if (!amount) return
    const success = await deposit(amount, vault.assetDecimals)
    if (success) {
      onSuccess()
      setTimeout(onClose, 2000) // Auto-close after 2s
    }
  }

  const handleMax = () => {
    setAmount(assetBalance)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const getStepStatus = (targetStep: TransactionStep): 'pending' | 'active' | 'complete' | 'error' => {
    if (error && step === 'error') return 'error'
    if (step === targetStep) return 'active'
    if (targetStep === 'approved' && (step === 'depositing' || step === 'deposited')) return 'complete'
    if (targetStep === 'deposited' && step === 'deposited') return 'complete'
    return 'pending'
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
          <h2 className="text-2xl">Deposit {vault.assetSymbol}</h2>
          <button className="btn-icon" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <label className="label">Amount</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`0.0 ${vault.assetSymbol}`}
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
            <span className="text-sm text-secondary">Balance: {parseFloat(assetBalance).toFixed(6)} {vault.assetSymbol}</span>
            <span className="text-sm text-secondary">Fee: {vault.feePercent}%</span>
          </div>
        </div>

        {/* Transaction Steps */}
        {step !== 'idle' && (
          <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-xl)', background: 'var(--surface-secondary)' }}>
            <h4 className="text-sm" style={{ marginBottom: 'var(--space-md)', fontWeight: 600 }}>Transaction Progress</h4>
            
            {needsApproval && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <div className={`status-dot status-${getStepStatus('approved')}`} />
                <span className="text-sm">Approve {vault.assetSymbol}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div className={`status-dot status-${getStepStatus('deposited')}`} />
              <span className="text-sm">Deposit to vault</span>
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
          {needsApproval && step !== 'approved' && step !== 'deposited' ? (
            <button
              className="btn btn-primary"
              onClick={handleApprove}
              disabled={loading || !amount || parseFloat(amount) === 0}
              style={{ flex: 1 }}
            >
              {loading && step === 'approving' ? 'Approving...' : `Approve ${vault.assetSymbol}`}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleDeposit}
              disabled={loading || !amount || parseFloat(amount) === 0 || step === 'deposited'}
              style={{ flex: 1 }}
            >
              {loading && step === 'depositing' ? 'Depositing...' : step === 'deposited' ? 'Deposited!' : 'Deposit'}
            </button>
          )}
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

