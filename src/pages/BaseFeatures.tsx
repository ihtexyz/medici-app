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

      {/* Base Pay Section (Phase 5) */}
      <section style={{ marginBottom: 'var(--cb-space-2xl)' }}>
        <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Base Pay - USDC Payments
        </h2>
        <p className="cb-caption" style={{
          marginBottom: 'var(--cb-space-lg)',
          color: 'var(--cb-text-secondary)',
        }}>
          Accept instant USDC payments with minimal friction using Base Account SDK
        </p>

        <div className="cb-card">
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div className="cb-caption" style={{
              marginBottom: 'var(--cb-space-md)',
              color: 'var(--cb-text-secondary)',
            }}>
              Base Pay Example
            </div>

            <div style={{
              padding: 'var(--cb-space-md)',
              background: 'var(--cb-gray-1)',
              borderRadius: '8px',
              marginBottom: 'var(--cb-space-md)',
            }}>
              <pre style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--cb-text)',
                overflow: 'auto',
              }}>
{`import { pay } from '@base-org/account'

const payment = await pay({
  amount: "10.00",  // USD amount
  to: "0x...",      // Recipient
  testnet: true     // Use testnet
})`}
              </pre>
            </div>

            <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)' }}>
              💡 Base Pay enables instant USDC payments with automatic currency conversion.
              Users can pay with any token, and recipients receive USDC.
            </div>
          </div>
        </div>
      </section>

      {/* Base Account Section (Phase 4) */}
      <section style={{ marginBottom: 'var(--cb-space-2xl)' }}>
        <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Base Account - Smart Wallet
        </h2>
        <p className="cb-caption" style={{
          marginBottom: 'var(--cb-space-lg)',
          color: 'var(--cb-text-secondary)',
        }}>
          ERC-4337 smart wallets with passkey authentication and cross-chain functionality
        </p>

        <div className="cb-card" style={{ marginBottom: 'var(--cb-space-md)' }}>
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-sm)' }}>🔐</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '4px' }}>
              Passkey Authentication
            </div>
            <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)', marginBottom: 'var(--cb-space-sm)' }}>
              No seed phrases - users authenticate with Face ID, Touch ID, or security keys
            </div>
            <div className="cb-caption" style={{ fontSize: '11px', color: 'var(--cb-text-tertiary)' }}>
              ✅ Universal sign-on across Base apps
            </div>
          </div>
        </div>

        <div className="cb-card" style={{ marginBottom: 'var(--cb-space-md)' }}>
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-sm)' }}>🌐</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '4px' }}>
              Multi-Chain Support
            </div>
            <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)', marginBottom: 'var(--cb-space-sm)' }}>
              One account works across 9 EVM networks simultaneously
            </div>
            <div className="cb-caption" style={{ fontSize: '11px', color: 'var(--cb-text-tertiary)' }}>
              ✅ Base, Ethereum, Optimism, Arbitrum, Polygon, and more
            </div>
          </div>
        </div>

        <div className="cb-card" style={{ marginBottom: 'var(--cb-space-md)' }}>
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-sm)' }}>⚡</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '4px' }}>
              Gas-less Transactions
            </div>
            <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)', marginBottom: 'var(--cb-space-sm)' }}>
              Optional transaction sponsorship for seamless user experience
            </div>
            <div className="cb-caption" style={{ fontSize: '11px', color: 'var(--cb-text-tertiary)' }}>
              ✅ Powered by ERC-4337 Account Abstraction
            </div>
          </div>
        </div>

        <div className="cb-card">
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div style={{ fontSize: '32px', marginBottom: 'var(--cb-space-sm)' }}>🗄️</div>
            <div className="cb-body" style={{ fontWeight: 600, marginBottom: '4px' }}>
              Data Vault
            </div>
            <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)', marginBottom: 'var(--cb-space-sm)' }}>
              Store and share contact details, shipping info across apps
            </div>
            <div className="cb-caption" style={{ fontSize: '11px', color: 'var(--cb-text-tertiary)' }}>
              ✅ User controls what data is shared
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Guide Section */}
      <section style={{ marginBottom: 'var(--cb-space-2xl)' }}>
        <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Integration Steps
        </h2>

        <div className="cb-card">
          <div style={{ padding: 'var(--cb-space-md)' }}>
            <div className="cb-caption" style={{
              marginBottom: 'var(--cb-space-md)',
              color: 'var(--cb-text-secondary)',
            }}>
              1. Install Base Account SDK
            </div>

            <div style={{
              padding: 'var(--cb-space-md)',
              background: 'var(--cb-gray-1)',
              borderRadius: '8px',
              marginBottom: 'var(--cb-space-lg)',
            }}>
              <pre style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--cb-text)',
              }}>
{`npm install @base-org/account @base-org/account-ui`}
              </pre>
            </div>

            <div className="cb-caption" style={{
              marginBottom: 'var(--cb-space-md)',
              color: 'var(--cb-text-secondary)',
            }}>
              2. Initialize Base Account SDK
            </div>

            <div style={{
              padding: 'var(--cb-space-md)',
              background: 'var(--cb-gray-1)',
              borderRadius: '8px',
              marginBottom: 'var(--cb-space-lg)',
            }}>
              <pre style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--cb-text)',
                overflow: 'auto',
              }}>
{`import { createBaseAccountSDK } from '@base-org/account'

const baseAccount = createBaseAccountSDK({
  // Configuration options
})`}
              </pre>
            </div>

            <div className="cb-caption" style={{
              marginBottom: 'var(--cb-space-md)',
              color: 'var(--cb-text-secondary)',
            }}>
              3. Add "Sign in with Base" Button
            </div>

            <div style={{
              padding: 'var(--cb-space-md)',
              background: 'var(--cb-gray-1)',
              borderRadius: '8px',
            }}>
              <pre style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--cb-text)',
                overflow: 'auto',
              }}>
{`import { SignInButton } from '@base-org/account-ui'

<SignInButton
  onSuccess={(account) => {
    console.log('Signed in:', account)
  }}
/>`}
              </pre>
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
