import { useEffect } from "react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ"
  }

  const colors = {
    success: "var(--color-success)",
    error: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-info)"
  }

  const bgColors = {
    success: "var(--color-success-bg)",
    error: "var(--color-error-bg)",
    warning: "var(--color-warning-bg)",
    info: "var(--color-info-bg)"
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: bgColors[toast.type],
        border: `1px solid ${colors[toast.type]}`,
        borderRadius: "var(--radius-md)",
        minWidth: 300,
        maxWidth: 500,
        boxShadow: "var(--shadow-lg)",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: colors[toast.type],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {icons[toast.type]}
      </div>
      <div style={{ flex: 1, fontSize: 14, color: "var(--color-text-primary)" }}>
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          fontSize: 18,
          padding: 0,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        style={{
          position: "fixed",
          top: 80,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </>
  )
}

