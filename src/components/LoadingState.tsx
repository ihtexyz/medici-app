import React from "react"

type LoadingStateProps = {
  type?: "card" | "table" | "inline" | "full"
  message?: string
  count?: number
}

/**
 * Skeleton loading component for better UX during data fetching
 */
export default function LoadingState({ 
  type = "inline", 
  message = "Loading...",
  count = 1 
}: LoadingStateProps) {
  
  if (type === "full") {
    return (
      <div style={{
        padding: '48px 16px',
        textAlign: 'center',
        color: '#888',
      }}>
        <div className="spinner" style={{
          width: 40,
          height: 40,
          border: '4px solid #333',
          borderTop: '4px solid #FF8A00',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: 16 }}>{message}</p>
      </div>
    )
  }

  if (type === "card") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="skeleton-card"
            style={{
              padding: 24,
              background: '#1a1a1a',
              borderRadius: 12,
              border: '1px solid #333',
            }}
          >
            <div className="skeleton-line" style={{
              height: 24,
              width: '40%',
              background: 'linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4,
              marginBottom: 16,
            }} />
            <div className="skeleton-line" style={{
              height: 16,
              width: '100%',
              background: 'linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4,
              marginBottom: 8,
            }} />
            <div className="skeleton-line" style={{
              height: 16,
              width: '80%',
              background: 'linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4,
            }} />
          </div>
        ))}
      </div>
    )
  }

  if (type === "table") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '16px 12px',
              background: '#1a1a1a',
              borderRadius: 8,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div style={{
              height: 16,
              width: '30%',
              background: 'linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4,
            }} />
            <div style={{
              height: 16,
              width: '25%',
              background: 'linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4,
            }} />
            <div style={{
              height: 16,
              width: '20%',
              background: 'linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4,
              marginLeft: 'auto',
            }} />
          </div>
        ))}
      </div>
    )
  }

  // inline type
  return (
    <div style={{
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      color: '#888',
    }}>
      <div className="spinner-small" style={{
        width: 20,
        height: 20,
        border: '3px solid #333',
        borderTop: '3px solid #FF8A00',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <span>{message}</span>
    </div>
  )
}

// Add keyframes to global stylesheet via style tag
if (typeof document !== 'undefined') {
  const styleId = 'loading-state-animations'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `
    document.head.appendChild(style)
  }
}

