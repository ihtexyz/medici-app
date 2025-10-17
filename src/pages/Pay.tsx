import { useMemo, useState } from "react"
import { DESTINATION_USE_CASES, SUPPORTED_CHAINS } from "../config/swap-assets"
import { useSwapKit } from "../state/swapkit"
import { useContacts } from "../context/ContactsContext"
import { executeSwap, getQuote, type SwapQuote } from "../services/swapkit"

export default function Pay() {
  const { ready, error, apiKey, projectId } = useSwapKit()
  const { contacts } = useContacts()

  const [recipientId, setRecipientId] = useState<string>(contacts[0]?.id ?? "")
  const [fromChain, setFromChain] = useState("bitcoin")
  const [toChain, setToChain] = useState("zcash")
  const [amount, setAmount] = useState("")
  const [useCase, setUseCase] = useState("wallet")
  const [status, setStatus] = useState<string | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [sending, setSending] = useState(false)
  const [quote, setQuote] = useState<SwapQuote | null>(null)

  const recipient = useMemo(
    () => contacts.find((c) => c.id === recipientId) ?? null,
    [contacts, recipientId],
  )

  const canQuote = useMemo(() => {
    return ready && !!recipient && amount && parseFloat(amount) > 0 && !quoting && !sending
  }, [ready, recipient, amount, quoting, sending])

  const configSummary = (() => {
    if (!ready || !apiKey || !projectId) return null
    return `SwapKit ready (project ${projectId.slice(0, 6)}…)`
  })()

  const doQuote = async () => {
    if (!canQuote) return
    setQuoting(true)
    setStatus(null)
    setQuote(null)
    try {
      const q = await getQuote({
        fromChain,
        toChain,
        amount: parseFloat(amount),
        useCase,
      })
      setQuote(q)
    } catch (err) {
      setStatus(`Quote failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setQuoting(false)
    }
  }

  const doSend = async () => {
    if (!ready || sending || !recipient) return
    setSending(true)
    setStatus(null)
    try {
      const effectiveQuote = quote ?? (await getQuote({
        fromChain,
        toChain,
        amount: parseFloat(amount),
        useCase,
      }))
      const res = await executeSwap(effectiveQuote)
      const desc = `${effectiveQuote.amountIn} ${fromChain.toUpperCase()} → ${effectiveQuote.estimatedOut.toFixed(6)} ${toChain.toUpperCase()}`
      setStatus(
        `Sent to ${recipient.name} (${recipient.address}): ${desc}${res.txHash ? ` (tx: ${res.txHash.slice(0, 10)}…)` : ""}`,
      )
    } catch (err) {
      setStatus(`Send failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="hero">
      <div className="hero-lede">Pay</div>
      <h1 className="hero-title">Spend with multi-chain liquidity</h1>
      <p className="hero-sub">
        Select a contact and route funds across chains. Zcash payments use
        Zashi wallet integration.
      </p>

      <div className="kpi-grid" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-label">Recipient</div>
          {contacts.length === 0 ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              No contacts yet. Add one on the Contacts page.
            </div>
          ) : (
            <select
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 8, background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "white" }}
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.address.slice(0, 6)}…{c.address.slice(-4)})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="card">
          <div className="card-label">From</div>
          <select
            value={fromChain}
            onChange={(e) => setFromChain(e.target.value)}
            style={{ width: "100%", marginTop: 8, padding: 8, background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "white" }}
          >
            {SUPPORTED_CHAINS.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.label} ({chain.native})
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          <div className="card-label">To</div>
          <select
            value={toChain}
            onChange={(e) => setToChain(e.target.value)}
            style={{ width: "100%", marginTop: 8, padding: 8, background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "white" }}
          >
            {SUPPORTED_CHAINS.filter((c) => c.id !== fromChain).map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.label} ({chain.native})
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          <div className="card-label">Amount</div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{ width: "100%", marginTop: 8, padding: 8, background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "white" }}
          />
        </div>

        <div className="card">
          <div className="card-label">Use Case</div>
          <select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            style={{ width: "100%", marginTop: 8, padding: 8, background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "white" }}
          >
            {DESTINATION_USE_CASES.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="actions" style={{ marginTop: 24 }}>
        <div className="action-grid">
          <div className="action-card">
            <div className="action-head">
              <div className="action-title">Send</div>
            </div>
            <div className="action-body">
              {recipient ? (
                <>
                  {recipient.name} · {recipient.address}
                  {quote && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                      Quote: receive ~{quote.estimatedOut.toFixed(6)} {SUPPORTED_CHAINS.find(c => c.id === toChain)?.native} · fee ${quote.feeUsd.toFixed(2)} · provider {quote.provider}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Select a contact to send to.</div>
              )}
            </div>
            <div className="action-cta">
              <button
                className="button-secondary"
                type="button"
                onClick={doQuote}
                disabled={!canQuote}
                style={{ marginRight: 8 }}
              >
                {quoting ? "Quoting…" : "Get Quote"}
              </button>
              <button
                className="button"
                type="button"
                onClick={doSend}
                disabled={!ready || !recipient || sending || !amount || parseFloat(amount) <= 0}
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>

          {(error || configSummary || status) && (
            <div className="action-card">
              <div className="action-head">
                <div className="action-title">Status</div>
              </div>
              <div className="action-body" style={{ color: error ? "#ff7a7a" : "rgba(255,255,255,0.6)", fontSize: 14 }}>
                {error || configSummary || status}
              </div>
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
