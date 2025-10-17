import { useState, useEffect } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { ethers } from "ethers"

import { getEnvOptional as getEnv } from "../lib/runtime-env"
import { useMarketData } from "../hooks/useMarketData"
import useCentBalance from "../hooks/useCentBalance"

/**
 * Portfolio Page - Coinbase Assets Style
 * Shows user's token balances with:
 * - Total portfolio value
 * - Individual token cards
 * - Price charts (future)
 * - Transaction history (future)
 */
export default function Portfolio() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const rpcUrl = getEnv("VITE_RPC_URL") || ""
  const { stats } = useMarketData(rpcUrl)
  const { balance: centBalance } = useCentBalance()

  const [btcBalance, setBtcBalance] = useState<string>("0")
  const [usdcBalance, setUsdcBalance] = useState<string>("0")
  const [loading, setLoading] = useState(true)

  // Fetch user balances
  useEffect(() => {
    async function fetchBalances() {
      if (!address || !rpcUrl) return

      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl)

        // Mock balances for now (replace with real contract calls)
        // const btcContract = new ethers.Contract(WBTC_ADDRESS, ERC20_ABI, provider)
        // const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider)
        // const btcBal = await btcContract.balanceOf(address)
        // const usdcBal = await usdcContract.balanceOf(address)

        // Mock data
        setBtcBalance("0.05")
        setUsdcBalance("1500.00")
      } catch (error) {
        console.error("Error fetching balances:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalances()
  }, [address, rpcUrl])

  // Calculate total portfolio value
  const btcPrice = stats?.btcPrice || 67500
  const usdcPrice = stats?.usdcPrice || 1
  const centPrice = 1 // CENT is pegged to USD

  const btcValue = parseFloat(btcBalance) * btcPrice
  const usdcValue = parseFloat(usdcBalance) * usdcPrice
  const centValue = centBalance ? (Number(centBalance) / 1e6) * centPrice : 0
  const totalValue = btcValue + usdcValue + centValue

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
        <div style={{ fontSize: '64px', marginBottom: 'var(--cb-space-lg)' }}>📊</div>
        <h2 className="cb-title" style={{ marginBottom: 'var(--cb-space-md)' }}>
          View your portfolio
        </h2>
        <p className="cb-body" style={{ 
          color: 'var(--cb-text-secondary)',
          marginBottom: 'var(--cb-space-xl)',
        }}>
          Connect your wallet to see your balances and transaction history
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
        <h1 className="cb-title">Portfolio</h1>
        <p className="cb-caption" style={{ marginTop: 'var(--cb-space-xs)' }}>
          Track your assets and activity
        </p>
      </div>

      {/* Total Value Card */}
      <div className="cb-card" style={{ 
        marginBottom: 'var(--cb-space-xl)',
        background: 'linear-gradient(135deg, #FF9500 0%, #FF6B35 100%)',
        padding: 'var(--cb-space-xl)',
      }}>
        <div className="cb-caption" style={{ 
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: 'var(--cb-space-sm)',
        }}>
          Total Balance
        </div>
        <div className="balance-large" style={{ 
          color: 'white',
          marginBottom: 'var(--cb-space-md)',
        }}>
          ${totalValue.toFixed(2)}
        </div>
        <div style={{ 
          display: 'flex',
          gap: 'var(--cb-space-sm)',
          color: 'rgba(255, 255, 255, 0.9)',
        }}>
          <span className="cb-caption">+$124.50 (2.4%)</span>
          <span className="cb-caption">Today</span>
        </div>
      </div>

      {/* Assets Section */}
      <div style={{ marginBottom: 'var(--cb-space-lg)' }}>
        <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Your assets
        </h2>

        {/* BTC Card */}
        <div className="cb-card" style={{ 
          marginBottom: 'var(--cb-space-md)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cb-space-md)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              ₿
            </div>
            <div style={{ flex: 1 }}>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
                Bitcoin
              </div>
              <div className="cb-caption">
                {btcBalance} BTC
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
                ${btcValue.toFixed(2)}
              </div>
              <div className="cb-caption" style={{ color: 'var(--cb-green)' }}>
                +2.5%
              </div>
            </div>
          </div>
        </div>

        {/* USDC Card */}
        <div className="cb-card" style={{ 
          marginBottom: 'var(--cb-space-md)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cb-space-md)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0A84FF 0%, #5AC8FA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              $
            </div>
            <div style={{ flex: 1 }}>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
                USD Coin
              </div>
              <div className="cb-caption">
                {usdcBalance} USDC
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
                ${usdcValue.toFixed(2)}
              </div>
              <div className="cb-caption" style={{ color: 'var(--cb-text-tertiary)' }}>
                0.0%
              </div>
            </div>
          </div>
        </div>

        {/* CENT Card */}
        {centBalance && Number(centBalance) > 0 && (
          <div className="cb-card" style={{ 
            marginBottom: 'var(--cb-space-md)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--cb-space-md)',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #AF52DE 0%, #FF2D55 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                ¢
              </div>
              <div style={{ flex: 1 }}>
                <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
                  CENT
                </div>
                <div className="cb-caption">
                  {(Number(centBalance) / 1e6).toFixed(2)} CENT
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
                  ${centValue.toFixed(2)}
                </div>
                <div className="cb-caption" style={{ color: 'var(--cb-text-tertiary)' }}>
                  0.0%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Section */}
      <div style={{ marginBottom: 'var(--cb-space-lg)' }}>
        <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
          Recent activity
        </h2>

        {/* Empty State */}
        <div className="cb-card" style={{ 
          textAlign: 'center',
          padding: 'var(--cb-space-xl)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--cb-space-md)' }}>
            📋
          </div>
          <div className="cb-body" style={{ 
            color: 'var(--cb-text-secondary)',
            marginBottom: 'var(--cb-space-sm)',
          }}>
            No recent activity
          </div>
          <div className="cb-caption">
            Your transactions will appear here
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--cb-space-md)',
        marginTop: 'var(--cb-space-xl)',
      }}>
        <button
          className="cb-btn cb-btn-secondary"
          onClick={() => window.location.href = '/borrow'}
        >
          Buy More
        </button>
        <button
          className="cb-btn cb-btn-tertiary"
          onClick={() => window.location.href = '/swap'}
        >
          Convert
        </button>
      </div>
    </div>
  )
}
