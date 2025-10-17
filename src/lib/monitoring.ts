import { getEnvOptional } from "./runtime-env"

export function initMonitoring() {
  const dsn = getEnvOptional("VITE_MONITOR_URL")
  if (dsn) {
    ;(window as any).ORIGAMI_MONITOR_URL = dsn
  }

  window.addEventListener("unhandledrejection", (event) => {
    try {
      const url = (window as any).ORIGAMI_MONITOR_URL as string | undefined
      if (!url) return
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "unhandledrejection", reason: String(event.reason) }),
      }).catch(() => {})
    } catch {}
  })

  window.addEventListener("error", (event) => {
    try {
      const url = (window as any).ORIGAMI_MONITOR_URL as string | undefined
      if (!url) return
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "error", message: event.message, filename: event.filename, lineno: event.lineno }),
      }).catch(() => {})
    } catch {}
  })
}





