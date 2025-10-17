import { useEffect, useMemo, useState } from "react"

import { CHAIN_ID, CONTRACTS } from "../config/contracts"
import useWallet from "../hooks/useWallet"
import { fetchBestQuote, type QuoteResult } from "../lib/quote"
import { getEnvOptional as getEnv } from "../lib/runtime-env"
import { submitEarnIntent } from "../services/execution"
import { recordActivity } from "../state/activity"
import LoadingState from "../components/LoadingState"
import TransactionPreview from "../components/TransactionPreview"

export default function Explore() {
  const [asset, setAsset] = useState<"CENT" | "BTC">("CENT")
  const [amount, setAmount] = useState<number>(1000)
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [steps, setSteps] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  
  const rpcUrl = getEnv("VITE_RPC_URL")
  const { provider, address, connect, isConnecting } = useWallet(rpcUrl)
  
  const amountUsd = useMemo(
    () => (asset === "CENT" ? amount : amount * 54000),
    [asset, amount],
  )

  useEffect(() => {
    const run = async () => {
      if (!rpcUrl) return
      setLoading(true)
      try {
        const q = await fetchBestQuote({
          rpcUrl,
          side: "lend",
          amountUsd,
        })
        setQuote(q)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [amountUsd])

  const handleReview = () => {
    if (!address) {
      connect()
      return
    }
    setShowPreview(true)
  }

  const handleConfirm = async () => {
    if (!provider || !quote) return
    setSubmitting(true)
    setSteps([])
    setStatus(null)
    setTxHash(null)

    try {
      const receipt = await submitEarnIntent(
        provider,
        {
          amountUSD: amountUsd,
          asset: asset === "BTC" ? CONTRACTS.MockWBTC : CONTRACTS.MockUSDC,
          aprBps: quote.aprBps,
        },
        {
          onProgress: (m) => setSteps((prev) => [...prev, m]),
        },
      )
      
      if (receipt?.hash) {
        setTxHash(receipt.hash)
        setStatus("success")
        recordActivity({
          id: `${Date.now()}`,
          type: "earn",
          amountUSD: amountUsd,
          asset,
          timestamp: Date.now(),
        })
      }
    } catch (err) {
      setStatus("error")
      setSteps((prev) => [...prev, `Error: ${err instanceof Error ? err.message : "Deposit failed"}`])
    } finally {
      setSubmitting(false)
    }
  }

  const projectedEarnings = useMemo(() => {
    if (!quote) return { daily: 0, monthly: 0, yearly: 0 }
    const apr = quote.aprBps / 10000
    return {
      daily: (amountUsd * apr) / 365,
      monthly: (amountUsd * apr) / 12,
      yearly: amountUsd * apr,
    }
  }, [quote, amountUsd])

  return (
    <div className="container-sm" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="badge badge-success" style={{ marginBottom: 16 }}>
          📈 Earn
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
          Earn Fixed Yields
        </h1>
        <p className="text-lg text-secondary" style={{ maxWidth: 560, margin: '0 auto' }}>
          Deposit your assets and earn competitive, transparent yields. No lock-ups, withdraw anytime.
        </p>
      </div>

      {/* Main Earn Interface */}
      <div className="card" style={{ marginBottom: 24 }}>
        {/* Asset Selection */}
        <div style={{ marginBottom: 32 }}>
          <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
            Select Asset
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}>
            <button
              onClick={() => setAsset("CENT")}
              className={`card ${asset === "CENT" ? 'card-hover' : ''}`}
              style={{
                border: asset === "CENT" ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                cursor: 'pointer',
                padding: 16,
                textAlign: 'left',
                background: asset === "CENT" ? 'var(--color-bg-elevated)' : 'var(--color-bg-primary)',
              }}
            >
              <div className="flex items-center gap-sm mb-xs">
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF8A00 0%, #E67A00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16
                }}>
                  ¢
                </div>
                <div className="font-semibold">CENT</div>
              </div>
              <div className="text-xs text-secondary">Stablecoin</div>
            </button>

            <button
              onClick={() => setAsset("BTC")}
              className={`card ${asset === "BTC" ? 'card-hover' : ''}`}
              style={{
                border: asset === "BTC" ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                cursor: 'pointer',
                padding: 16,
                textAlign: 'left',
                background: asset === "BTC" ? 'var(--color-bg-elevated)' : 'var(--color-bg-primary)',
              }}
            >
              <div className="flex items-center gap-sm mb-xs">
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F7931A 0%, #d67d13 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16
                }}>
                  ₿
                </div>
                <div className="font-semibold">BTC</div>
              </div>
              <div className="text-xs text-secondary">Bitcoin</div>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: 32 }}>
          <div className="flex justify-between items-center mb-sm">
            <label className="text-sm font-medium">Deposit Amount</label>
            {asset === "BTC" && (
              <span className="text-sm text-secondary">
                ≈ ${amountUsd.toLocaleString()}
              </span>
            )}
          </div>
          <div className="input-group">
            <input
              type="number"
              className="input"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              min={0}
              step={asset === "CENT" ? 100 : 0.001}
            />
            <div className="input-suffix">{asset}</div>
          </div>
          {asset === "CENT" && (
            <div className="flex gap-sm mt-sm">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setAmount(1000)}
              >
                $1,000
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setAmount(5000)}
              >
                $5,000
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setAmount(10000)}
              >
                $10,000
              </button>
            </div>
          )}
        </div>

        {/* APY Display */}
        {loading ? (
          <LoadingState type="card" count={1} />
        ) : quote ? (
          <div style={{
            background: 'linear-gradient(135deg, #1a3a1c 0%, #0f2412 100%)',
            border: '2px solid var(--color-success)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            marginBottom: 24
          }}>
            <div className="text-sm" style={{ color: 'var(--color-success)', marginBottom: 8 }}>
              Current APY
            </div>
            <div className="flex justify-between items-center">
              <div className="text-4xl font-bold" style={{ color: 'var(--color-success)' }}>
                {(quote.aprBps / 100).toFixed(2)}%
              </div>
              <div className="badge badge-success">Fixed Rate</div>
            </div>
            <div className="text-xs text-secondary" style={{ marginTop: 12 }}>
              Rate range: {(quote.aprMinBps / 100).toFixed(2)}% – {(quote.aprMaxBps / 100).toFixed(2)}%
            </div>
          </div>
        ) : null}

        {/* Projected Earnings */}
        {quote && (
          <div className="card card-compact" style={{ background: 'var(--color-bg-tertiary)', marginBottom: 24 }}>
            <div className="text-sm font-medium mb-md">Projected Earnings</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              textAlign: 'center'
            }}>
              <div>
                <div className="text-xs text-secondary mb-xs">Daily</div>
                <div className="font-semibold">
                  ${projectedEarnings.daily.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-xs">Monthly</div>
                <div className="font-semibold">
                  ${projectedEarnings.monthly.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary mb-xs">Yearly</div>
                <div className="font-semibold text-brand">
                  ${projectedEarnings.yearly.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Details */}
        {quote && (
          <div className="card card-compact" style={{ background: 'var(--color-bg-tertiary)', marginBottom: 24 }}>
            <div className="flex justify-between mb-md">
              <span className="text-sm text-secondary">Available Liquidity</span>
              <span className="font-semibold">
                ${quote.coverageUsd.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between mb-md">
              <span className="text-sm text-secondary">Estimated Fees</span>
              <span className="font-semibold">
                ${quote.estFeesUsd?.toFixed(2) ?? '0.00'}
              </span>
            </div>
            <div style={{ 
              borderTop: '1px solid var(--color-border)', 
              paddingTop: 12,
              marginTop: 12 
            }}>
              <details>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontSize: 14, 
                  color: 'var(--color-text-secondary)',
                  userSelect: 'none'
                }}>
                  View offer breakdown
                </summary>
                <div style={{ 
                  marginTop: 12, 
                  fontSize: 12, 
                  color: 'var(--color-text-tertiary)',
                  display: 'grid',
                  gap: 4
                }}>
                  {quote.routes.slice(0, 4).map((route) => (
                    <div key={route.id} className="flex justify-between">
                      <span>Demand #{route.id}</span>
                      <span>{(route.aprBps / 100).toFixed(2)}% · ${route.amountUsd.toFixed(0)}</span>
                    </div>
                  ))}
                  {quote.routes.length > 4 && (
                    <div className="text-xs">+{quote.routes.length - 4} more demands</div>
                  )}
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={handleReview}
          disabled={isConnecting || amount <= 0}
        >
          {!address ? (isConnecting ? 'Connecting...' : 'Connect Wallet to Continue') : 'Review Deposit'}
        </button>
      </div>

      {/* Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div className="card card-compact">
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
          <div className="font-semibold mb-xs">Secure</div>
          <div className="text-sm text-secondary">
            Your funds are protected by smart contracts and blockchain security.
          </div>
        </div>
        <div className="card card-compact">
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
          <div className="font-semibold mb-xs">Flexible</div>
          <div className="text-sm text-secondary">
            No lock-up periods. Withdraw your funds anytime with accrued interest.
          </div>
        </div>
        <div className="card card-compact">
          <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
          <div className="font-semibold mb-xs">Transparent</div>
          <div className="text-sm text-secondary">
            Fixed rates with clear terms. See exactly where your funds are deployed.
          </div>
        </div>
      </div>

      {/* Transaction Preview Modal */}
      <TransactionPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirm}
        title="Review Your Deposit"
        details={[
          { label: 'Asset', value: asset, highlight: false },
          { label: 'Amount', value: `${amount} ${asset}`, highlight: true },
          { label: 'Value', value: `$${amountUsd.toLocaleString()}`, highlight: false },
          { label: 'APY', value: `${quote ? (quote.aprBps / 100).toFixed(2) : '—'}%`, highlight: false },
          { label: 'Est. Monthly Earnings', value: `$${projectedEarnings.monthly.toFixed(2)}`, highlight: false },
          { label: 'Est. Yearly Earnings', value: `$${projectedEarnings.yearly.toFixed(2)}`, highlight: false },
          { label: 'Estimated Fees', value: `$${quote?.estFeesUsd?.toFixed(2) ?? '0.00'}`, highlight: false },
        ]}
        steps={steps.map((step, i) => ({
          label: step,
          status: status === "error" && i === steps.length - 1 ? "error" :
                  status === "success" && i === steps.length - 1 ? "complete" :
                  i === steps.length - 1 ? "active" : "complete"
        }))}
        estimatedTime="1-2 minutes"
        confirmLabel="Confirm Deposit"
        isSubmitting={submitting}
      />

      {/* Success State */}
      {status === "success" && txHash && (
        <div className="card" style={{ 
          background: 'var(--color-success-bg)', 
          border: '2px solid var(--color-success)' 
        }}>
          <div className="flex items-center gap-md mb-md">
            <span style={{ fontSize: 32 }}>✅</span>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>
                Deposit Successful!
              </h3>
              <p className="text-sm text-secondary" style={{ marginTop: 4 }}>
                Your funds are now earning {quote ? (quote.aprBps / 100).toFixed(2) : '—'}% APY.
              </p>
            </div>
          </div>
          {CHAIN_ID === 421614 && (
            <a 
              href={`https://sepolia.arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              View on Arbiscan ↗
            </a>
          )}
        </div>
      )}
    </div>
  )
}
