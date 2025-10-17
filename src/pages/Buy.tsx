import { useState } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

/**
 * Buy Page - On/Off Ramp
 * Figma: 218-261
 * 
 * Allows users to buy crypto with fiat using Coinbase integration
 */
export default function Buy() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const [amount, setAmount] = useState('100')
  const [selectedAmount, setSelectedAmount] = useState<string | null>('10')

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
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>💳</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Connect to buy crypto
        </h2>
        <p className="cb-body" style={{ 
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to purchase Bitcoin or stablecoins with your debit card
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

  return (
    <div style={{ 
      padding: 'var(--cb-space-lg)',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <h1 className="cb-title" style={{ marginBottom: 'var(--cb-space-xs)' }}>
          Buy BTC
        </h1>
        <p className="cb-caption">
          Add 0.1 BTC to get your free $100
        </p>
      </div>

      {/* Info Card */}
      <div style={{
        background: 'var(--cb-card-bg)',
        borderRadius: '16px',
        padding: 'var(--cb-space-lg)',
        marginBottom: 'var(--cb-space-lg)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: 'var(--cb-space-md)' }}>
          🪙
        </div>
        <p className="cb-body" style={{ marginBottom: 'var(--cb-space-xs)' }}>
          To use doplet, you need a little BTC in your account. Select how much you want to buy or transfer. Your $100 will be sent right after!
        </p>
      </div>

      {/* Amount Selection */}
      <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <h3 className="cb-body" style={{ 
          fontWeight: 600,
          marginBottom: 'var(--cb-space-md)',
        }}>
          How much BTC?
        </h3>

        {/* Quick Amount Buttons */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: 'var(--cb-space-lg)',
        }}>
          {[
            { amount: '5', usd: '5 USDC' },
            { amount: '10', usd: '10 USDC', popular: true },
            { amount: '20', usd: '20 USDC' },
          ].map((option) => (
            <button
              key={option.amount}
              onClick={() => {
                setSelectedAmount(option.amount)
                setAmount(option.amount)
              }}
              style={{
                background: selectedAmount === option.amount ? 'var(--cb-orange)' : 'var(--cb-card-bg)',
                color: selectedAmount === option.amount ? 'black' : 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              {option.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '8px',
                  background: 'var(--cb-orange)',
                  color: 'black',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '8px',
                }}>
                  POPULAR
                </div>
              )}
              <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
                ${option.amount}
              </div>
              <div style={{ 
                fontSize: '13px',
                opacity: 0.7,
              }}>
                {option.usd}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div>
          <label className="cb-caption" style={{ display: 'block', marginBottom: '8px' }}>
            Other amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setSelectedAmount(null)
            }}
            placeholder="Enter amount"
            style={{
              width: '100%',
              background: 'var(--cb-card-bg)',
              border: '1px solid var(--cb-gray-2)',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
              fontSize: '17px',
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => open({ view: 'OnRampProviders' })}
          style={{
            background: 'var(--cb-orange)',
            color: 'black',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '17px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Fund my account
        </button>

        <p className="cb-caption" style={{ textAlign: 'center', margin: '8px 0' }}>
          or
        </p>

        <button
          onClick={() => {
            // Open transfer modal or navigate to receive
            window.location.href = '/pay'
          }}
          style={{
            background: 'transparent',
            color: 'var(--cb-text-primary)',
            border: '1px solid var(--cb-gray-2)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '17px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Transfer from another account
        </button>
      </div>

      {/* Info Note */}
      <div style={{
        display: 'flex',
        alignItems: 'start',
        gap: '12px',
        marginTop: 'var(--cb-space-xl)',
        padding: 'var(--cb-space-md)',
        background: 'rgba(255, 149, 0, 0.1)',
        borderRadius: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>💡</span>
        <div>
          <p className="cb-caption" style={{ marginBottom: '4px', fontWeight: 600, color: 'var(--cb-orange)' }}>
            Fund with CENT instead
          </p>
          <p className="cb-caption" style={{ fontSize: '13px' }}>
            You can also fund your account with CENT stablecoin from the Venice Fi platform.
          </p>
        </div>
      </div>
    </div>
  )
}

