import { useState, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseUnits, formatUnits, type Address } from 'viem'
import { useToast } from '../context/ToastContext'

// Minimal ERC4626 ABI for Genesis Vaults
const VAULT_ABI = [
  {
    inputs: [],
    name: 'asset',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'assets', type: 'uint256' }],
    name: 'previewDeposit',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'shares', type: 'uint256' }],
    name: 'previewRedeem',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    name: 'deposit',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    name: 'redeem',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// ERC20 ABI for approvals
const ERC20_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export type TransactionStep = 'idle' | 'approving' | 'approved' | 'depositing' | 'deposited' | 'error'

export function useVault(vaultAddress: Address | undefined, assetAddress: Address | undefined) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<TransactionStep>('idle')
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<string>()

  // Get asset balance
  const getAssetBalance = useCallback(async (): Promise<string> => {
    if (!publicClient || !address || !assetAddress) return '0'

    try {
      const balance = await publicClient.readContract({
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })
      const decimals = await publicClient.readContract({
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })
      return formatUnits(balance, decimals)
    } catch (err) {
      console.error('Error getting asset balance:', err)
      return '0'
    }
  }, [publicClient, address, assetAddress])

  // Get vault shares
  const getVaultShares = useCallback(async (): Promise<string> => {
    if (!publicClient || !address || !vaultAddress) return '0'

    try {
      const shares = await publicClient.readContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'balanceOf',
        args: [address],
      })
      // Shares are always 18 decimals for our vaults
      return formatUnits(shares, 18)
    } catch (err) {
      console.error('Error getting vault shares:', err)
      return '0'
    }
  }, [publicClient, address, vaultAddress])

  // Check allowance
  const getAllowance = useCallback(async (): Promise<bigint> => {
    if (!publicClient || !address || !assetAddress || !vaultAddress) return 0n

    try {
      const allowance = await publicClient.readContract({
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, vaultAddress],
      })
      return allowance
    } catch (err) {
      console.error('Error getting allowance:', err)
      return 0n
    }
  }, [publicClient, address, assetAddress, vaultAddress])

  // Approve asset
  const approve = useCallback(
    async (amount: string, decimals: number): Promise<boolean> => {
      if (!walletClient || !address || !assetAddress || !vaultAddress) {
        setError('Wallet not connected')
        return false
      }

      try {
        setLoading(true)
        setStep('approving')
        setError(undefined)

        const amountBigInt = parseUnits(amount, decimals)

        const hash = await walletClient.writeContract({
          address: assetAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [vaultAddress, amountBigInt],
        })

        setTxHash(hash)
        showToast('Approval submitted', 'info')

        // Wait for confirmation
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash })
        }

        setStep('approved')
        showToast('Approval confirmed', 'success')

        return true
      } catch (err: any) {
        console.error('Approval error:', err)
        const errorMessage = err?.message || 'Approval failed'
        setError(errorMessage)
        setStep('error')
        showToast(errorMessage, 'error')
        return false
      } finally {
        setLoading(false)
      }
    },
    [walletClient, publicClient, address, assetAddress, vaultAddress, showToast]
  )

  // Deposit assets
  const deposit = useCallback(
    async (amount: string, decimals: number): Promise<boolean> => {
      if (!walletClient || !publicClient || !address || !vaultAddress) {
        setError('Wallet not connected')
        return false
      }

      try {
        setLoading(true)
        setStep('depositing')
        setError(undefined)

        const amountBigInt = parseUnits(amount, decimals)

        // Check allowance first
        const currentAllowance = await getAllowance()
        if (currentAllowance < amountBigInt) {
          showToast('Please approve the vault first', 'error')
          setError('Insufficient allowance')
          setStep('error')
          return false
        }

        const hash = await walletClient.writeContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'deposit',
          args: [amountBigInt, address],
        })

        setTxHash(hash)
        showToast('Deposit submitted', 'info')

        // Wait for confirmation
        await publicClient.waitForTransactionReceipt({ hash })

        setStep('deposited')
        showToast('Deposit confirmed', 'success')

        return true
      } catch (err: any) {
        console.error('Deposit error:', err)
        const errorMessage = err?.message || 'Deposit failed'
        setError(errorMessage)
        setStep('error')
        showToast(errorMessage, 'error')
        return false
      } finally {
        setLoading(false)
      }
    },
    [walletClient, publicClient, address, vaultAddress, getAllowance, showToast]
  )

  // Withdraw (redeem shares)
  const withdraw = useCallback(
    async (shares: string): Promise<boolean> => {
      if (!walletClient || !publicClient || !address || !vaultAddress) {
        setError('Wallet not connected')
        return false
      }

      try {
        setLoading(true)
        setStep('depositing') // Reusing step for simplicity
        setError(undefined)

        const sharesBigInt = parseUnits(shares, 18) // Shares are always 18 decimals

        const hash = await walletClient.writeContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'redeem',
          args: [sharesBigInt, address, address],
        })

        setTxHash(hash)
        showToast('Withdrawal submitted', 'info')

        // Wait for confirmation
        await publicClient.waitForTransactionReceipt({ hash })

        setStep('deposited')
        showToast('Withdrawal confirmed', 'success')

        return true
      } catch (err: any) {
        console.error('Withdrawal error:', err)
        const errorMessage = err?.message || 'Withdrawal failed'
        setError(errorMessage)
        setStep('error')
        showToast(errorMessage, 'error')
        return false
      } finally {
        setLoading(false)
      }
    },
    [walletClient, publicClient, address, vaultAddress, showToast]
  )

  // Reset state
  const reset = useCallback(() => {
    setLoading(false)
    setStep('idle')
    setTxHash(undefined)
    setError(undefined)
  }, [])

  return {
    // State
    loading,
    step,
    txHash,
    error,

    // Methods
    getAssetBalance,
    getVaultShares,
    getAllowance,
    approve,
    deposit,
    withdraw,
    reset,
  }
}

