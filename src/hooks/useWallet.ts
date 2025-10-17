import { useCallback, useEffect, useMemo, useState } from "react"
import { BrowserProvider, Eip1193Provider, JsonRpcProvider } from "ethers"

type WalletState = {
  address: string | null
  chainIdHex: string | null
  isConnecting: boolean
}

const useWallet = (rpcUrlFromEnv?: string) => {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainIdHex: null,
    isConnecting: false,
  })

  // EIP-1193 injected provider (MetaMask et al.) if available
  const eip1193: Eip1193Provider | undefined = (() => {
    if (typeof window === "undefined") return undefined
    const withEthereum = window as typeof window & {
      ethereum?: Eip1193Provider
    }
    return withEthereum.ethereum
  })()

  // Wallet-backed provider when connected; otherwise read-only json-rpc provider
  const provider = useMemo(() => {
    if (eip1193) return new BrowserProvider(eip1193)
    if (rpcUrlFromEnv) return new JsonRpcProvider(rpcUrlFromEnv)
    return undefined
  }, [eip1193, rpcUrlFromEnv])

  const connect = useCallback(async () => {
    if (!eip1193) {
      throw new Error("No EIP-1193 provider found. Install MetaMask.")
    }
    try {
      setState((s) => ({ ...s, isConnecting: true }))
      const accounts = (await eip1193.request({
        method: "eth_requestAccounts",
      })) as string[]
      const chainIdHex = (await eip1193.request({
        method: "eth_chainId",
      })) as string
      setState({
        address: accounts?.[0] ?? null,
        chainIdHex,
        isConnecting: false,
      })
    } catch (err) {
      setState((s) => ({ ...s, isConnecting: false }))
      try {
        const url = (window as any).ORIGAMI_MONITOR_URL as string | undefined
        if (url) {
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "wallet_connect_error", message: err instanceof Error ? err.message : String(err) }),
          }).catch(() => {})
        }
      } catch {}
      throw err
    }
  }, [eip1193])

  const disconnect = useCallback(() => {
    setState({ address: null, chainIdHex: null, isConnecting: false })
  }, [])

  // keep state in sync with wallet events
  useEffect(() => {
    if (!eip1193 || typeof eip1193 !== "object") return undefined
    const onFn = (eip1193 as { on?: (...args: unknown[]) => void }).on
    const removeFn = (
      eip1193 as { removeListener?: (...args: unknown[]) => void }
    ).removeListener
    const handleAccountsChanged = (accounts: string[]) => {
      setState((s) => ({ ...s, address: accounts?.[0] ?? null }))
    }
    const handleChainChanged = (chainIdHex: string) => {
      setState((s) => ({ ...s, chainIdHex }))
    }
    if (typeof onFn === "function") {
      onFn("accountsChanged", handleAccountsChanged)
      onFn("chainChanged", handleChainChanged)
    }
    return () => {
      if (typeof removeFn === "function") {
        removeFn("accountsChanged", handleAccountsChanged)
        removeFn("chainChanged", handleChainChanged)
      }
    }
  }, [eip1193])

  return {
    address: state.address,
    chainIdHex: state.chainIdHex,
    isConnecting: state.isConnecting,
    provider,
    connect,
    disconnect,
  }
}

export default useWallet
