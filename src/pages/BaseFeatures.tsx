import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import {
  Identity,
  Avatar,
  Name,
  Badge,
  Address,
} from '@coinbase/onchainkit/identity'
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction'

/**
 * Base Features Page
 * Demonstrates OnchainKit components for Base integration:
 * - Identity: Avatar, Name, Badge, Address
 * - Transactions: Transaction buttons and status
 * - Future: Swap and Fund components
 */
export default function BaseFeatures() {
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  if (!isConnected) {
    return (
      <div style={{
        padding: 'var(--cb-space-lg)',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: 'var(--cb-space-2xl)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>🏗️</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Base Features
        </h2>
        <p className="cb-body" style={{
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to explore OnchainKit components powered by Base
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
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
        <h1 className="cb-title">Base Features</h1>
        <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
          Powered by OnchainKit - Coinbase's React SDK for Base
        </p>
      </div>

      {/* Identity Section */}
      <section style={{ marginBottom: 'var(--cb-space-2xl)' }}>
        <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Identity Components
        </h2>
        <p className="cb-caption" style={{
          marginBottom: 'var(--cb-space-lg)',
          color: 'var(--cb-text-secondary)',
        }}>
          Display wallet identity with Avatar, Name, Badge, and Address components
        </p>

        {/* Full Identity Component */}
        <div className="cb-card" style={{ marginBottom: 'var(--cb-space-md)' }}>
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div className="cb-caption" style={{
              marginBottom: 'var(--cb-space-sm)',
              color: 'var(--cb-text-secondary)',
            }}>
              Complete Identity
            </div>
            {address && (
              <Identity
                address={address}
                schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
              >
                <Avatar />
                <Name />
                <Badge />
                <Address />
              </Identity>
            )}
          </div>
        </div>

        {/* Individual Components */}
        <div className="cb-card" style={{ marginBottom: 'var(--cb-space-md)' }}>
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div className="cb-caption" style={{
              marginBottom: 'var(--cb-space-sm)',
              color: 'var(--cb-text-secondary)',
            }}>
              Avatar Only
            </div>
            {address && (
              <Identity address={address}>
                <Avatar />
              </Identity>
            )}
          </div>
        </div>

        <div className="cb-card" style={{ marginBottom: 'var(--cb-space-md)' }}>
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div className="cb-caption" style={{
              marginBottom: 'var(--cb-space-sm)',
              color: 'var(--cb-text-secondary)',
            }}>
              Name + Badge
            </div>
            {address && (
              <Identity address={address}>
                <Name />
                <Badge />
              </Identity>
            )}
          </div>
        </div>

        <div className="cb-card">
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div className="cb-caption" style={{
              marginBottom: 'var(--cb-space-sm)',
              color: 'var(--cb-text-secondary)',
            }}>
              Address Component
            </div>
            {address && (
              <Identity address={address}>
                <Address />
              </Identity>
            )}
          </div>
        </div>
      </section>

      {/* Transaction Section */}
      <section style={{ marginBottom: 'var(--cb-space-2xl)' }}>
        <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Transaction Components
        </h2>
        <p className="cb-caption" style={{
          marginBottom: 'var(--cb-space-lg)',
          color: 'var(--cb-text-secondary)',
        }}>
          Build transaction flows with smart status handling and user feedback
        </p>

        <div className="cb-card">
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div className="cb-caption" style={{
              marginBottom: 'var(--cb-space-md)',
              color: 'var(--cb-text-secondary)',
            }}>
              Transaction Flow Example
            </div>

            <Transaction
              contracts={[
                // Example: Simple ETH transfer
                {
                  address: '0x0000000000000000000000000000000000000000',
                  abi: [],
                  functionName: '',
                  args: [],
                },
              ]}
              onStatus={(status) => {
                console.log('Transaction status:', status)
              }}
            >
              <TransactionButton text="Send Transaction" />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>

            <div className="cb-caption" style={{
              marginTop: 'var(--cb-space-md)',
              color: 'var(--cb-text-secondary)',
            }}>
              Note: This is a demo component. Configure with real contract calls for production.
            </div>
          </div>
        </div>
      </section>

      {/* Future Features Section */}
      <section style={{ marginBottom: 'var(--cb-space-2xl)' }}>
        <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Coming Soon
        </h2>
        <div className="cb-card" style={{ marginBottom: 'var(--cb-space-md)' }}>
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-sm)' }}>🔄</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '4px' }}>
              Swap Component
            </div>
            <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)' }}>
              Built-in token swapping powered by Uniswap and Base
            </div>
          </div>
        </div>

        <div className="cb-card">
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-sm)' }}>💳</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '4px' }}>
              Fund Component (Onramp)
            </div>
            <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)' }}>
              Buy crypto with fiat directly in your app via Coinbase
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <div className="cb-card" style={{ background: 'var(--cb-gray-1)' }}>
        <div style={{ padding: 'var(--cb-space-md)' }}>
          <div className="cb-caption" style={{ marginBottom: 'var(--cb-space-sm)' }}>
            💡 About OnchainKit
          </div>
          <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)' }}>
            OnchainKit is Coinbase's React component library for building onchain applications.
            It provides pre-built, customizable components for Identity, Transactions, Swaps,
            Funding, and more - all optimized for Base.
          </div>
        </div>
      </div>
    </div>
  )
}
