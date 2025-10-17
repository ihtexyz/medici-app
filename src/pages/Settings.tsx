import { Link } from "react-router-dom"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useChainId, useDisconnect } from "wagmi"
import { useToast } from "../context/ToastContext"

/**
 * Settings/More Page - Coinbase Style
 * 
 * Features:
 * - Account info
 * - Settings & preferences
 * - Network info
 * - Logout
 * - Links to other pages
 */
export default function Settings() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const chainId = useChainId()
  const { disconnect } = useDisconnect()
  const { showToast } = useToast()

  const handleDisconnect = async () => {
    try {
      disconnect()
      showToast('Disconnected successfully', 'success')
    } catch (error) {
      showToast('Failed to disconnect', 'error')
    }
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
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>⚙️</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Connect to access settings
        </h2>
        <p className="cb-body" style={{ 
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to access your account settings and preferences
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
          Settings
        </h1>
        <p className="cb-caption">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Card */}
      <div className="cb-card" style={{ marginBottom: 'var(--cb-space-md)' }}>
        <div style={{ marginBottom: 'var(--cb-space-md)' }}>
          <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            Connected Account
          </div>
          <div className="cb-body cb-mono" style={{ 
            fontSize: '14px',
            wordBreak: 'break-all',
            color: 'var(--cb-text-primary)',
          }}>
            {address}
          </div>
        </div>
        <div>
          <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-xs)' }}>
            Network
          </div>
          <div className="cb-body" style={{ fontSize: '15px' }}>
            {chainId === 421614 ? 'Arbitrum Sepolia (Testnet)' : `Chain ID: ${chainId}`}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--cb-space-xs)',
        marginBottom: 'var(--cb-space-xl)',
      }}>
        <Link 
          to="/portfolio" 
          className="cb-card"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            padding: 'var(--cb-space-md) var(--cb-space-lg)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-md)' }}>
            <span style={{ fontSize: '24px' }}>💼</span>
            <div>
              <div className="cb-body" style={{ fontWeight: 600 }}>Portfolio</div>
              <div className="cb-caption">View your assets</div>
            </div>
          </div>
          <span style={{ color: 'var(--cb-text-tertiary)' }}>→</span>
        </Link>

        <Link 
          to="/rewards" 
          className="cb-card"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            padding: 'var(--cb-space-md) var(--cb-space-lg)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-md)' }}>
            <span style={{ fontSize: '24px' }}>🎁</span>
            <div>
              <div className="cb-body" style={{ fontWeight: 600 }}>Rewards</div>
              <div className="cb-caption">Claim CENT tokens</div>
            </div>
          </div>
          <span style={{ color: 'var(--cb-text-tertiary)' }}>→</span>
        </Link>

        <Link 
          to="/contacts" 
          className="cb-card"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            padding: 'var(--cb-space-md) var(--cb-space-lg)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-md)' }}>
            <span style={{ fontSize: '24px' }}>👥</span>
            <div>
              <div className="cb-body" style={{ fontWeight: 600 }}>Contacts</div>
              <div className="cb-caption">Manage saved addresses</div>
            </div>
          </div>
          <span style={{ color: 'var(--cb-text-tertiary)' }}>→</span>
        </Link>

        <button 
          onClick={() => open()}
          className="cb-card"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--cb-space-md) var(--cb-space-lg)',
            cursor: 'pointer',
            border: 'none',
            background: 'var(--cb-card-bg)',
            borderRadius: 'var(--cb-radius-lg)',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-md)' }}>
            <span style={{ fontSize: '24px' }}>👛</span>
            <div>
              <div className="cb-body" style={{ fontWeight: 600, color: 'var(--cb-text-primary)' }}>
                Manage Wallet
              </div>
              <div className="cb-caption">Change network or wallet</div>
            </div>
          </div>
          <span style={{ color: 'var(--cb-text-tertiary)' }}>→</span>
        </button>
      </div>

      {/* Disconnect Button */}
      <button
        className="cb-btn"
        onClick={handleDisconnect}
        style={{
          background: 'var(--cb-gray-1)',
          color: 'var(--cb-red)',
          width: '100%',
        }}
      >
        Disconnect Wallet
      </button>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center',
        marginTop: 'var(--cb-space-2xl)',
        paddingTop: 'var(--cb-space-xl)',
        borderTop: '1px solid var(--cb-gray-1)',
      }}>
        <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>
          Medici by Venice Fi
        </div>
        <div className="cb-caption" style={{ fontSize: '12px' }}>
          Version 1.0.0 • Powered by Venice Fi
        </div>
      </div>
    </div>
  )
}

