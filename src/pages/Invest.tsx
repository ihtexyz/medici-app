import { useState, useEffect } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useChainId } from "wagmi"
import { getVaultsForChain, hasVaultsDeployed, type VaultConfig } from "../config/vaults"
import { useToast } from "../context/ToastContext"
import LoadingState from "../components/LoadingState"
import VaultDepositModal from "../components/VaultDepositModal"
import VaultWithdrawModal from "../components/VaultWithdrawModal"
import { useVaultData } from "../hooks/useVaultData"
import { getEnvOptional as getEnv } from "../lib/runtime-env"
import type { VaultData } from "../services/vaultData"

/**
 * Invest Page - Genesis Vaults (Coinbase Style)
 * 
 * Allows users to deposit assets into Genesis Vaults (BTC, USDC, USDT) to earn yield.
 * Features:
 * - Vault discovery (list all available vaults)
 * - Deposit flow with approvals
 * - Withdraw flow
 * - Real-time TVL, APY, user balances
 * - Clean mobile-first design
 */
export default function Invest() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const chainId = useChainId()
  const { showToast } = useToast()
  const rpcUrl = getEnv("VITE_RPC_URL") || "unset"
  
  const [vaults, setVaults] = useState<VaultConfig[]>([])
  const [selectedVault, setSelectedVault] = useState<VaultConfig | null>(null)
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Load vaults for current chain
  useEffect(() => {
    setLoading(true)
    const chainVaults = getVaultsForChain(chainId)
    setVaults(chainVaults)
    setLoading(false)
    
    if (chainVaults.length === 0 && chainId) {
      showToast('Vaults not yet deployed on this network', 'info')
    }
  }, [chainId, showToast])
  
  // Check if vaults are deployed
  const vaultsDeployed = hasVaultsDeployed(chainId)
  
  // Fetch real vault data
  const vaultAddresses = vaults.map(v => v.address)
  const { vaults: vaultData, loading: vaultDataLoading, refresh } = useVaultData(
    rpcUrl,
    vaultAddresses,
    address
  )
  
  return (
    <div style={{ 
      padding: 'var(--cb-space-lg)',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--cb-space-xl)" }}>
        <h1 className="cb-title" style={{ marginBottom: "var(--cb-space-xs)" }}>
          Invest
        </h1>
        <p className="cb-caption">
          Earn yield by lending your assets
        </p>
      </div>
      
      {/* Not Connected */}
      {!isConnected && (
        <div style={{ textAlign: 'center', paddingTop: 'var(--cb-space-xl)' }}>
          <div style={{ fontSize: "64px", marginBottom: "var(--cb-space-lg)" }}>💰</div>
          <h2 className="cb-subtitle" style={{ marginBottom: "var(--cb-space-md)" }}>
            Start earning
          </h2>
          <p className="cb-body" style={{ 
            color: 'var(--cb-text-secondary)',
            marginBottom: "var(--cb-space-xl)",
          }}>
            Connect your wallet to view available vaults and start earning yield
          </p>
          <button className="cb-btn cb-btn-primary" onClick={() => open()}>
            Connect Wallet
          </button>
        </div>
      )}
      
      {/* Vaults Not Deployed */}
      {isConnected && !vaultsDeployed && (
        <div className="cb-card" style={{ padding: "var(--cb-space-xl)", textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "var(--cb-space-lg)" }}>🚧</div>
          <h2 className="cb-subtitle" style={{ marginBottom: "var(--cb-space-md)" }}>
            Vaults Coming Soon
          </h2>
          <p className="cb-body" style={{ 
            color: 'var(--cb-text-secondary)',
            marginBottom: "var(--cb-space-md)",
          }}>
            Genesis Vaults are not yet deployed on this network
          </p>
          <p className="cb-caption">
            Current Network: {chainId ? `Chain ID ${chainId}` : 'Unknown'}
          </p>
        </div>
      )}
      
      {/* Loading */}
      {loading && isConnected && (
        <div style={{ textAlign: 'center', padding: 'var(--cb-space-2xl)' }}>
          <div style={{ 
            width: '40px',
            height: '40px',
            border: '3px solid var(--cb-gray-1)',
            borderTopColor: 'var(--cb-orange)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}></div>
          <p className="cb-caption" style={{ marginTop: 'var(--cb-space-md)' }}>
            Loading vaults...
          </p>
        </div>
      )}
      
      {/* Vaults List */}
      {isConnected && !loading && vaultsDeployed && (
        <>
          {/* Vault Cards */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--cb-space-md)",
            marginBottom: "var(--cb-space-xl)"
          }}>
            {vaults.map((vault) => (
              <VaultCard
                key={vault.address}
                vault={vault}
                vaultData={vaultData[vault.address]}
                loading={vaultDataLoading}
                onDeposit={() => {
                  setSelectedVault(vault)
                  setModalType('deposit')
                }}
                onWithdraw={() => {
                  setSelectedVault(vault)
                  setModalType('withdraw')
                }}
                userAddress={address}
                refreshKey={refreshKey}
              />
            ))}
          </div>
          
          {/* Info Section */}
          <div className="cb-card" style={{ padding: "var(--cb-space-lg)" }}>
            <h3 className="cb-subtitle" style={{ marginBottom: "var(--cb-space-md)" }}>
              How it works
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--cb-space-lg)" }}>
              <div>
                <div style={{ fontSize: "32px", marginBottom: "var(--cb-space-sm)" }}>💰</div>
                <h4 className="cb-body" style={{ fontWeight: 600, marginBottom: "var(--cb-space-xs)" }}>
                  Deposit Assets
                </h4>
                <p className="cb-caption">
                  Deposit BTC, USDC, or USDT into vaults. Receive shares representing your deposit.
                </p>
              </div>
              <div>
                <div style={{ fontSize: "32px", marginBottom: "var(--cb-space-sm)" }}>📈</div>
                <h4 className="cb-body" style={{ fontWeight: 600, marginBottom: "var(--cb-space-xs)" }}>
                  Earn Yield
                </h4>
                <p className="cb-caption">
                  Your assets are lent to borrowers. Interest accrues automatically to your shares.
                </p>
              </div>
              <div>
                <div style={{ fontSize: "32px", marginBottom: "var(--cb-space-sm)" }}>🔓</div>
                <h4 className="cb-body" style={{ fontWeight: 600, marginBottom: "var(--cb-space-xs)" }}>
                  Withdraw Anytime
                </h4>
                <p className="cb-caption">
                  Redeem your shares for assets plus earned interest. No lock-up period.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Deposit/Withdraw Modals */}
      {selectedVault && modalType === 'deposit' && (
        <VaultDepositModal
          vault={selectedVault}
          onClose={() => {
            setSelectedVault(null)
            setModalType(null)
          }}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1) // Trigger refresh
            showToast('Deposit successful!', 'success')
          }}
        />
      )}
      
      {selectedVault && modalType === 'withdraw' && (
        <VaultWithdrawModal
          vault={selectedVault}
          onClose={() => {
            setSelectedVault(null)
            setModalType(null)
          }}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1) // Trigger refresh
            showToast('Withdrawal successful!', 'success')
          }}
        />
      )}
    </div>
  )
}

/**
 * Vault Card Component - Coinbase Style
 */
function VaultCard({ 
  vault,
  vaultData,
  loading,
  onDeposit,
  onWithdraw,
  userAddress,
  refreshKey
}: { 
  vault: VaultConfig
  vaultData?: VaultData
  loading: boolean
  onDeposit: () => void
  onWithdraw: () => void
  userAddress: string | undefined
  refreshKey: number
}) {
  // Use real vault data
  const tvl = vaultData ? `$${vaultData.tvlFormatted}` : '$0'
  const apy = vaultData?.apy || '0.00'
  const userBalance = vaultData?.userBalance || '0'
  const userShares = vaultData?.userShares || '0'
  const userSharesValue = vaultData?.userSharesValue || '0'
  
  return (
    <div className="cb-card" style={{ padding: "var(--cb-space-lg)" }}>
      {/* Vault Icon & Name */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "var(--cb-space-md)", 
        marginBottom: "var(--cb-space-lg)" 
      }}>
        <div style={{ 
          width: "48px", 
          height: "48px", 
          borderRadius: "50%", 
          background: vault.assetSymbol === 'BTC' 
            ? 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)'
            : vault.assetSymbol === 'USDC'
            ? 'linear-gradient(135deg, #0A84FF 0%, #5AC8FA 100%)'
            : 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px"
        }}>
          {vault.logo}
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="cb-body" style={{ fontWeight: 600, marginBottom: '2px' }}>
            {vault.assetSymbol} Vault
          </h3>
          <p className="cb-caption">{vault.symbol}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="cb-body" style={{ fontWeight: 600, color: 'var(--cb-green)' }}>
            {loading ? '...' : `${apy}%`}
          </div>
          <div className="cb-caption">APY</div>
        </div>
      </div>
      
      {/* Stats */}
      <div style={{ marginBottom: "var(--cb-space-lg)" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginBottom: "var(--cb-space-sm)" 
        }}>
          <span className="cb-caption">TVL</span>
          {loading ? (
            <span className="cb-caption">...</span>
          ) : (
            <span className="cb-body-sm cb-mono">{tvl}</span>
          )}
        </div>
        
        {userAddress && (
          <>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginBottom: "var(--cb-space-sm)" 
            }}>
              <span className="cb-caption">Your Balance</span>
              {loading ? (
                <span className="cb-caption">...</span>
              ) : (
                <span className="cb-body-sm cb-mono">
                  {parseFloat(userBalance).toFixed(4)} {vault.assetSymbol}
                </span>
              )}
            </div>
            
            {parseFloat(userShares) > 0 && (
              <>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  marginBottom: "var(--cb-space-sm)" 
                }}>
                  <span className="cb-caption">Your Shares</span>
                  <span className="cb-body-sm cb-mono">
                    {parseFloat(userShares).toFixed(4)} {vault.symbol}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="cb-caption">Value</span>
                  <span className="cb-body-sm cb-mono" style={{ color: 'var(--cb-orange)' }}>
                    {parseFloat(userSharesValue).toFixed(4)} {vault.assetSymbol}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
      
      {/* Actions */}
      {userAddress && (
        <div style={{ 
          display: "flex", 
          gap: "var(--cb-space-sm)" 
        }}>
          <button 
            className="cb-btn cb-btn-primary" 
            onClick={(e) => {
              e.stopPropagation()
              onDeposit()
            }}
            style={{ flex: 1 }}
          >
            Deposit
          </button>
          <button 
            className="cb-btn cb-btn-tertiary" 
            onClick={(e) => {
              e.stopPropagation()
              onWithdraw()
            }}
            style={{ flex: 1 }}
          >
            Withdraw
          </button>
        </div>
      )}
    </div>
  )
}

