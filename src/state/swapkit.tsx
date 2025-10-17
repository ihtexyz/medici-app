import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { getEnvOptional } from "../lib/runtime-env"

type SwapKitContextValue = {
  ready: boolean
  error: string | null
  apiKey: string | null
  projectId: string | null
}

const SwapKitContext = createContext<SwapKitContextValue>({
  ready: false,
  error: null,
  apiKey: null,
  projectId: null,
})

export function SwapKitProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    const enabled = (getEnvOptional("VITE_ENABLE_SWAPS") ?? "true").toLowerCase() !== "false"
    const key = getEnvOptional("VITE_SWAPKIT_API_KEY") || null
    const project = getEnvOptional("VITE_SWAPKIT_PROJECT_ID") || null

    if (!enabled) {
      setError("Swaps disabled by environment flag")
      setReady(false)
      setApiKey(null)
      setProjectId(null)
      return
    }

    if (!key || !project) {
      // Missing credentials → stay not-ready but allow UI to function with mock quotes
      setError("SwapKit credentials missing – using mock quotes")
      setReady(false)
      setApiKey(null)
      setProjectId(null)
      return
    }

    setApiKey(key)
    setProjectId(project)
    setReady(true)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({ ready, error, apiKey, projectId }),
    [ready, error, apiKey, projectId],
  )

  return (
    <SwapKitContext.Provider value={value}>{children}</SwapKitContext.Provider>
  )
}

export const useSwapKit = () => useContext(SwapKitContext)
