import { useEffect, useMemo, useState } from "react"
import type { Provider } from "ethers"
import { Contract, JsonRpcProvider } from "ethers"

import { CENT, CentErc20Abi } from "../token/cent"
import { getEnvOptional } from "../lib/runtime-env"

import useWallet from "./useWallet"

type BigNumberish = bigint | number

function scale(value: BigNumberish, decimals: number) {
  return Number(value) / 10 ** decimals
}

export default function useCentBalance() {
  const rpcUrl = getEnvOptional("VITE_RPC_URL") || ""
  const rewardAddress = getEnvOptional("VITE_CENT_REWARD_ADDRESS") || ""
  const { address, provider } = useWallet(rpcUrl)
  const [balance, setBalance] = useState<string>("0")
  const [claimable, setClaimable] = useState<string>("0")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const readProvider = useMemo<Provider | undefined>(() => {
    if (provider) return provider
    if (rpcUrl) return new JsonRpcProvider(rpcUrl)
    return undefined
  }, [provider])

  useEffect(() => {
    if (
      !readProvider ||
      !address ||
      !CENT.address ||
      !rewardAddress
    ) {
      return () => undefined
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const erc20 = new Contract(CENT.address, CentErc20Abi, readProvider)
        const rewards = new Contract(
          rewardAddress,
          [
            {
              inputs: [{ internalType: "address", name: "", type: "address" }],
              name: "claimed",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [{ internalType: "address", name: "", type: "address" }],
              name: "claimable",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          readProvider,
        )
        const [bal, decimals, claimableRaw] = await Promise.all([
          erc20.balanceOf(address).catch(() => 0n),
          erc20.decimals().catch(() => CENT.decimals),
          rewards.claimable(address).catch(() => 0n),
        ])
        if (cancelled) return
        const scaledBalance = scale(bal, Number(decimals))
        const scaledClaimable = scale(claimableRaw, Number(decimals))
        setBalance(
          scaledBalance.toLocaleString(undefined, { maximumFractionDigits: 4 }),
        )
        setClaimable(
          scaledClaimable.toLocaleString(undefined, {
            maximumFractionDigits: 4,
          }),
        )
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load CENT balance",
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [readProvider, address])

  return { balance, claimable, loading, error, address }
}
