import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { ethers } from "ethers"

import { getEnvOptional as getEnv } from "../lib/runtime-env"
import { useMarketData } from "../hooks/useMarketData"
import useCentBalance from "../hooks/useCentBalance"
import { useTransactionHistory } from "../hooks/useTransactionHistory"
import { useETHBalance } from "../hooks/useETHBalance"
import { useAllTroves } from "../hooks/useAllTroves"
import { useAllPrices } from "../hooks/useAllPrices"
import TransactionHistory from "../components/TransactionHistory"

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
  const { ethBalance, isLoading: ethLoading, symbol: ethSymbol } = useETHBalance()
  const { activeTroves, loading: trovesLoading, hasAnyTrove } = useAllTroves(address)
  const { prices, loading: pricesLoading } = useAllPrices()

  const [btcBalance, setBtcBalance] = useState<string>("0")
  const [usdcBalance, setUsdcBalance] = useState<string>("0")
  const [loading, setLoading] = useState(true)

  const { transactions, loading: loadingHistory, getRecentTransactions } = useTransactionHistory(address)

  // Fetch user balances
  useEffect(() => {
    async function fetchBalances() {
      if (!address || !rpcUrl) return

      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl)

        // ERC20 ABI for balanceOf
        const ERC20_ABI = [
          "function balanceOf(address owner) view returns (uint256)"
        ]

        // Get CENT addresses from config
        const { getBranches } = await import("../config/cent")
        const branches = getBranches()

        // Fetch balances from collateral tokens (WBTC, cbBTC)
        const balances = await Promise.all(
          branches.map(async (branch) => {
            try {
              const contract = new ethers.Contract(branch.collToken, ERC20_ABI, provider)
              const balance = await contract.balanceOf(address)
              return {
                symbol: branch.collSymbol,
                balance: balance,
                decimals: 18 // BTC wrappers use 18 decimals
              }
            } catch (error) {
              console.error(`Error fetching ${branch.collSymbol} balance:`, error)
              return { symbol: branch.collSymbol, balance: 0n, decimals: 18 }
            }
          })
        )

        // Sum up all BTC wrapper balances (WBTC + cbBTC)
        const totalBtc = balances.reduce((sum, b) => sum + b.balance, 0n)
        setBtcBalance((Number(totalBtc) / 1e18).toFixed(6))

        // Fetch USDC balance (Arbitrum USDC: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831)
        try {
          const usdcContract = new ethers.Contract(
            "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            ["function balanceOf(address) view returns (uint256)"],
            provider
          )
          const usdcBal = await usdcContract.balanceOf(address)
          // USDC has 6 decimals
          setUsdcBalance((Number(usdcBal) / 1e6).toFixed(2))
        } catch (error) {
          console.error("Error fetching USDC balance:", error)
          setUsdcBalance("0.00")
        }
      } catch (error) {
        console.error("Error fetching balances:", error)
        // Fallback to 0 on error
        setBtcBalance("0.00")
        setUsdcBalance("0.00")
      } finally {
        setLoading(false)
      }
    }

    fetchBalances()
  }, [address, rpcUrl])

  // Calculate total portfolio value
  const btcPrice = stats?.btcPrice || 67500
  const ethPrice = stats?.ethPrice || 3500 // Default ETH price
  const usdcPrice = stats?.usdcPrice || 1
  const centPrice = 1 // CENT is pegged to USD

  const btcValue = parseFloat(btcBalance) * btcPrice
  const ethValue = parseFloat(ethBalance) * ethPrice
  const usdcValue = parseFloat(usdcBalance) * usdcPrice
  const centValue = centBalance ? (Number(centBalance) / 1e6) * centPrice : 0
  const totalValue = btcValue + ethValue + usdcValue + centValue

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

      {/* Trove Positions Section */}
      {hasAnyTrove && (
        <div style={{ marginBottom: 'var(--cb-space-xl)' }}>
          <h2 className="cb-subtitle" style={{ marginBottom: 'var(--cb-space-md)' }}>
            Your Trove Positions
          </h2>

          {activeTroves.map((trove) => {
            if (!trove.data) return null;

            const collPrice = prices[trove.collateralSymbol] ? parseFloat(prices[trove.collateralSymbol]!) : 0;
            const collAmount = Number(trove.data.entireColl) / 1e18;
            const debtAmount = Number(trove.data.entireDebt) / 1e18;
            const collValue = collAmount * collPrice;
            const collateralRatio = debtAmount > 0 ? (collValue / debtAmount) * 100 : 0;
            const interestRate = Number(trove.data.annualInterestRate) / 1e16;

            const isHealthy = collateralRatio >= 150;
            const isAtRisk = collateralRatio < 150 && collateralRatio >= 120;
            const isCritical = collateralRatio < 120;

            return (
              <Link
                key={trove.collateralSymbol}
                to="/borrow"
                style={{ textDecoration: 'none' }}
              >
                <div className="cb-card" style={{
                  marginBottom: 'var(--cb-space-md)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  border: isCritical
                    ? '2px solid var(--cb-error)'
                    : isAtRisk
                    ? '2px solid #FF9500'
                    : '1px solid var(--cb-border)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--cb-space-md)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cb-space-md)' }}>
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
                      <div>
                        <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
                          {trove.collateralSymbol} Trove
                        </div>
                        <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)' }}>
                          {interestRate.toFixed(2)}% APR
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: isCritical
                        ? 'rgba(255, 69, 58, 0.1)'
                        : isAtRisk
                        ? 'rgba(255, 149, 0, 0.1)'
                        : 'rgba(52, 199, 89, 0.1)',
                      border: `1px solid ${
                        isCritical
                          ? 'rgba(255, 69, 58, 0.3)'
                          : isAtRisk
                          ? 'rgba(255, 149, 0, 0.3)'
                          : 'rgba(52, 199, 89, 0.3)'
                      }`,
                    }}>
                      <div className="cb-caption" style={{
                        fontWeight: 600,
                        color: isCritical
                          ? '#FF453A'
                          : isAtRisk
                          ? '#FF9500'
                          : '#34C759',
                      }}>
                        {isCritical ? '🚨 Critical' : isAtRisk ? '⚠️ At Risk' : '✅ Healthy'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--cb-space-md)',
                    paddingTop: 'var(--cb-space-md)',
                    borderTop: '1px solid var(--cb-border)',
                  }}>
                    <div>
                      <div className="cb-caption" style={{ marginBottom: '4px' }}>Collateral</div>
                      <div className="cb-body cb-mono" style={{ fontWeight: 600 }}>
                        {collAmount.toFixed(6)} {trove.collateralSymbol}
                      </div>
                      <div className="cb-caption" style={{ color: 'var(--cb-text-secondary)' }}>
                        ${collValue.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="cb-caption" style={{ marginBottom: '4px' }}>Debt</div>
                      <div className="cb-body cb-mono" style={{ fontWeight: 600 }}>
                        {debtAmount.toFixed(2)} CENT
                      </div>
                      <div className="cb-caption" style={{
                        color: isCritical
                          ? '#FF453A'
                          : isAtRisk
                          ? '#FF9500'
                          : 'var(--cb-success)',
                      }}>
                        CR: {collateralRatio.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {(isAtRisk || isCritical) && (
                    <div style={{
                      marginTop: 'var(--cb-space-md)',
                      padding: 'var(--cb-space-sm)',
                      background: isCritical
                        ? 'rgba(255, 69, 58, 0.05)'
                        : 'rgba(255, 149, 0, 0.05)',
                      borderRadius: '8px',
                    }}>
                      <div className="cb-caption" style={{
                        color: isCritical ? '#FF453A' : '#FF9500',
                      }}>
                        {isCritical
                          ? 'Add collateral or repay debt immediately to avoid liquidation'
                          : 'Consider adding collateral to improve your position health'}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {trovesLoading && (
            <div className="cb-caption" style={{ textAlign: 'center', padding: 'var(--cb-space-lg)' }}>
              Loading positions...
            </div>
          )}
        </div>
      )}

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

        {/* ETH Card */}
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
              background: 'linear-gradient(135deg, #627EEA 0%, #8C9EFF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              Ξ
            </div>
            <div style={{ flex: 1 }}>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
                Ethereum
              </div>
              <div className="cb-caption">
                {ethLoading ? 'Loading...' : `${ethBalance} ${ethSymbol}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
                ${ethValue.toFixed(2)}
              </div>
              <div className="cb-caption" style={{ color: 'var(--cb-green)' }}>
                +1.8%
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

        <TransactionHistory
          transactions={getRecentTransactions(10)}
          loading={loadingHistory}
          emptyMessage="No recent activity"
        />
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--cb-space-md)',
        marginTop: 'var(--cb-space-xl)',
      }}>
        <Link to="/borrow" className="cb-btn cb-btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Borrow
        </Link>
        <Link to="/swap" className="cb-btn cb-btn-tertiary" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Convert
        </Link>
      </div>
    </div>
  )
}
