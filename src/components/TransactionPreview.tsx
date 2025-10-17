import React from "react"

type TransactionStep = {
  label: string
  status: "pending" | "active" | "complete" | "error"
  message?: string
}

type TransactionPreviewProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  details: Array<{ label: string; value: string; highlight?: boolean }>
  steps?: TransactionStep[]
  estimatedTime?: string
  warnings?: string[]
  confirmLabel?: string
  isSubmitting?: boolean
}

/**
 * Transaction preview modal with multi-step progress tracking
 */
export default function TransactionPreview({
  isOpen,
  onClose,
  onConfirm,
  title,
  details,
  steps = [],
  estimatedTime,
  warnings = [],
  confirmLabel = "Confirm Transaction",
  isSubmitting = false,
}: TransactionPreviewProps) {
  if (!isOpen) return null

  const hasActiveSteps = steps.length > 0
  const isComplete = steps.every(s => s.status === "complete")
  const hasError = steps.some(s => s.status === "error")

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <div
        style={{
          background: "#0e1116",
          borderRadius: 16,
          maxWidth: 500,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid #333",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #333",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h2>
          {!isSubmitting && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#888",
                fontSize: 24,
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Transaction Details */}
        <div style={{ padding: "24px" }}>
          {details.map((detail, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: i < details.length - 1 ? "1px solid #222" : "none",
              }}
            >
              <span style={{ color: "#888", fontSize: 14 }}>{detail.label}</span>
              <span
                style={{
                  color: detail.highlight ? "#FF8A00" : "white",
                  fontSize: 14,
                  fontWeight: detail.highlight ? 600 : 400,
                }}
              >
                {detail.value}
              </span>
            </div>
          ))}

          {/* Estimated Time */}
          {estimatedTime && !hasActiveSteps && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#1a1a1a",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>⏱️</span>
              <span style={{ fontSize: 14, color: "#888" }}>
                Estimated time: <strong style={{ color: "white" }}>{estimatedTime}</strong>
              </span>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {warnings.map((warning, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: "#2a1a0a",
                    border: "1px solid #8B4513",
                    borderRadius: 8,
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "start",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                  <span style={{ fontSize: 14, color: "#FFB84D" }}>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Progress Steps */}
          {hasActiveSteps && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: "#888" }}>Progress</h3>
              {steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "start",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  {/* Status Icon */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background:
                        step.status === "complete"
                          ? "#4CAF50"
                          : step.status === "active"
                          ? "#FF8A00"
                          : step.status === "error"
                          ? "#ff6b6b"
                          : "#333",
                      border: step.status === "active" ? "2px solid #FF8A00" : "none",
                    }}
                  >
                    {step.status === "complete" && <span style={{ fontSize: 14 }}>✓</span>}
                    {step.status === "error" && <span style={{ fontSize: 14 }}>✗</span>}
                    {step.status === "active" && (
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          border: "2px solid white",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    )}
                    {step.status === "pending" && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          background: "#555",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>

                  {/* Step Details */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color:
                          step.status === "active"
                            ? "white"
                            : step.status === "error"
                            ? "#ff6b6b"
                            : "#888",
                        marginBottom: step.message ? 4 : 0,
                      }}
                    >
                      {step.label}
                    </div>
                    {step.message && (
                      <div style={{ fontSize: 12, color: "#666" }}>{step.message}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!hasActiveSteps && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid #333",
              display: "flex",
              gap: 12,
            }}
          >
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: "#222",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: 16,
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: isSubmitting ? "#666" : "#FF8A00",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {isSubmitting ? "Processing..." : confirmLabel}
            </button>
          </div>
        )}

        {/* Close button when complete or error */}
        {hasActiveSteps && (isComplete || hasError) && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid #333" }}>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "12px 24px",
                background: isComplete ? "#4CAF50" : "#ff6b6b",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {isComplete ? "Done" : "Close"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

