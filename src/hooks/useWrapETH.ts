import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { getWETHAddress as getWETHAddressFromConfig } from '../config/tokens-multichain'

/**
 * WETH ABI - Standard WETH9 interface
 * Minimal ABI for deposit and withdraw functions
 */
const WETH_ABI = [
  {
    constant: false,
    inputs: [],
    name: 'deposit',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ name: 'wad', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

/**
 * Get WETH address for current chain
 */
function getWETHAddress(chainId: number | undefined): `0x${string}` | undefined {
  if (!chainId) return undefined
  const address = getWETHAddressFromConfig(chainId as 84532 | 421614 | 11155111)
  return address as `0x${string}` | undefined
}

/**
 * Hook to wrap ETH to WETH
 */
export function useWrapETH() {
  const { chain } = useAccount()
  const [isWrapping, setIsWrapping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wethAddress = getWETHAddress(chain?.id)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const wrap = async (amount: string) => {
    try {
      setIsWrapping(true)
      setError(null)

      if (!wethAddress) {
        throw new Error('WETH not supported on this chain')
      }

      const amountWei = parseEther(amount)

      writeContract({
        address: wethAddress,
        abi: WETH_ABI,
        functionName: 'deposit',
        value: amountWei,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to wrap ETH')
      setIsWrapping(false)
    }
  }

  return {
    wrap,
    isWrapping: isWrapping || isConfirming,
    isSuccess,
    error,
    hash,
    wethAddress,
  }
}

/**
 * Hook to unwrap WETH to ETH
 */
export function useUnwrapETH() {
  const { chain } = useAccount()
  const [isUnwrapping, setIsUnwrapping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wethAddress = getWETHAddress(chain?.id)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const unwrap = async (amount: string) => {
    try {
      setIsUnwrapping(true)
      setError(null)

      if (!wethAddress) {
        throw new Error('WETH not supported on this chain')
      }

      const amountWei = parseEther(amount)

      writeContract({
        address: wethAddress,
        abi: WETH_ABI,
        functionName: 'withdraw',
        args: [amountWei],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unwrap WETH')
      setIsUnwrapping(false)
    }
  }

  return {
    unwrap,
    isUnwrapping: isUnwrapping || isConfirming,
    isSuccess,
    error,
    hash,
    wethAddress,
  }
}

/**
 * Combined hook for wrap/unwrap operations
 */
export function useWrapUnwrapETH() {
  const wrapHook = useWrapETH()
  const unwrapHook = useUnwrapETH()

  return {
    wrap: wrapHook.wrap,
    unwrap: unwrapHook.unwrap,
    isWrapping: wrapHook.isWrapping,
    isUnwrapping: unwrapHook.isUnwrapping,
    wrapError: wrapHook.error,
    unwrapError: unwrapHook.error,
    wrapSuccess: wrapHook.isSuccess,
    unwrapSuccess: unwrapHook.isSuccess,
    wrapHash: wrapHook.hash,
    unwrapHash: unwrapHook.hash,
    wethAddress: wrapHook.wethAddress,
  }
}
