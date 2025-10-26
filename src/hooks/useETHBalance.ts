import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'

/**
 * Hook to fetch native ETH balance on current chain
 * Works on Base Sepolia, Arbitrum Sepolia, and ETH Sepolia
 */
export function useETHBalance() {
  const { address, isConnected, chain } = useAccount()
  const [ethBalance, setEthBalance] = useState<string>('0.00')
  const [isLoading, setIsLoading] = useState(false)

  // Use wagmi's useBalance hook for native ETH
  const { data: balance, isError, isLoading: balanceLoading } = useBalance({
    address: address,
    // No token parameter means native currency (ETH)
  })

  useEffect(() => {
    setIsLoading(balanceLoading)

    if (balance && !isError) {
      // Format balance to 4 decimal places
      const formatted = parseFloat(balance.formatted).toFixed(4)
      setEthBalance(formatted)
    } else if (isError || !isConnected) {
      setEthBalance('0.00')
    }
  }, [balance, isError, balanceLoading, isConnected])

  return {
    ethBalance,
    isLoading,
    isConnected,
    chainId: chain?.id,
    chainName: chain?.name,
    symbol: balance?.symbol || 'ETH',
    decimals: balance?.decimals || 18,
  }
}

/**
 * Hook to fetch native ETH balance on a specific chain
 * Useful for multi-chain portfolio views
 */
export function useETHBalanceOnChain(chainId: number) {
  const { address, isConnected } = useAccount()
  const [ethBalance, setEthBalance] = useState<string>('0.00')
  const [isLoading, setIsLoading] = useState(false)

  const { data: balance, isError, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: chainId,
  })

  useEffect(() => {
    setIsLoading(balanceLoading)

    if (balance && !isError) {
      const formatted = parseFloat(balance.formatted).toFixed(4)
      setEthBalance(formatted)
    } else if (isError || !isConnected) {
      setEthBalance('0.00')
    }
  }, [balance, isError, balanceLoading, isConnected])

  return {
    ethBalance,
    isLoading,
    chainId,
    symbol: balance?.symbol || 'ETH',
    decimals: balance?.decimals || 18,
  }
}

/**
 * Hook to fetch ETH balances on all supported chains
 * Returns balances for Base Sepolia, Arbitrum Sepolia, and ETH Sepolia
 */
export function useMultiChainETHBalance() {
  const baseSepoliaBalance = useETHBalanceOnChain(84532) // Base Sepolia
  const arbitrumSepoliaBalance = useETHBalanceOnChain(421614) // Arbitrum Sepolia
  const ethSepoliaBalance = useETHBalanceOnChain(11155111) // ETH Sepolia

  const totalETH = (
    parseFloat(baseSepoliaBalance.ethBalance) +
    parseFloat(arbitrumSepoliaBalance.ethBalance) +
    parseFloat(ethSepoliaBalance.ethBalance)
  ).toFixed(4)

  const isLoading =
    baseSepoliaBalance.isLoading ||
    arbitrumSepoliaBalance.isLoading ||
    ethSepoliaBalance.isLoading

  return {
    baseSepolia: baseSepoliaBalance,
    arbitrumSepolia: arbitrumSepoliaBalance,
    ethSepolia: ethSepoliaBalance,
    totalETH,
    isLoading,
  }
}
