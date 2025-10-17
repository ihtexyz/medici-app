import React, { useMemo } from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  zora,
} from "wagmi/chains"

// WalletProvider wires up wagmi for wallet connectivity across the app.
// RainbowKit is temporarily disabled due to React Query timing issues.
export function RainbowProvider({ children }: { children: React.ReactNode }) {

  const chains = useMemo(() => [mainnet, polygon, optimism, arbitrum, base, zora], [])

  const appName = import.meta.env.VITE_APP_NAME || "Medici dApp"
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

  const transports = useMemo(
    () =>
      chains.reduce((acc, chain) => {
        const endpoint = chain.rpcUrls.default.http[0]
        if (endpoint) {
          acc[chain.id] = http(endpoint)
        }
        return acc
      }, {} as Record<number, ReturnType<typeof http>>),
    [chains],
  )

  const { wallets, connectors } = useMemo(() => {
    const walletsConfig = getDefaultWallets({
      appName,
      projectId,
    })
    return walletsConfig
  }, [appName, projectId])

  const wagmiConfig = useMemo(() =>
    createConfig({
      chains: chains as [typeof mainnet, ...typeof chains],
      connectors,
      transports,
      ssr: false,
    }),
    [chains, connectors, transports],
  )

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider modalSize="compact">
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  )
}