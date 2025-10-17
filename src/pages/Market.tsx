export default function Market() {
  const cards = [
    {
      title: "Gift Cards by Bitrefill",
      description:
        "Spend CENT on 500+ global retailers. Earn bonus mats on eligible purchases.",
      link: "https://www.bitrefill.com",
      badge: "Earn bonus",
    },
    {
      title: "Ledger Hardware Wallet",
      description:
        "Secure your Bitcoin and CENT with the Medici x Ledger bundle.",
      link: "https://shop.ledger.com",
      badge: "Medici pick",
    },
    {
      title: "Brink Donations",
      description:
        "Support Bitcoin core development with recurring CENT contributions.",
      link: "https://brink.dev",
      badge: "Community",
    },
  ]

  return (
    <>
      <section className="hero">
        <div className="hero-lede">Market</div>
        <h1 className="hero-title">Spend CENT across the ecosystem</h1>
        <p className="hero-sub">
          Curated partners for shopping, hardware, and community support.
        </p>
      </section>

      <section className="kpi-grid">
        <div className="card">
          <div className="card-label">Spendable CENT</div>
          <div className="card-value">—</div>
        </div>
        <div className="card">
          <div className="card-label">Rewards multiplier</div>
          <div className="card-value">—</div>
        </div>
        <div className="card">
          <div className="card-label">Cashback</div>
          <div className="card-value">—</div>
        </div>
        <div className="card">
          <div className="card-label">Upcoming drops</div>
          <div className="card-value">—</div>
        </div>
      </section>

      <div className="two-col" style={{ marginTop: 16, gap: 12 }}>
        <div className="panel" style={{ background: "#0B0B0F" }}>
          <div className="action-head" style={{ marginBottom: 8 }}>
            <div className="action-title">Featured partners</div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {cards.map((card) => (
              <div
                key={card.title}
                className="panel"
                style={{ background: "#15151C" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div
                    className="metric"
                    style={{ textTransform: "uppercase", fontSize: 10 }}
                  >
                    {card.badge}
                  </div>
                  <a
                    className="button button--link"
                    href={card.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </div>
                <div
                  className="metric-strong"
                  style={{ fontSize: 18, marginBottom: 6 }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                  {card.description}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel" style={{ background: "#0B0B0F" }}>
          <div className="action-title" style={{ marginBottom: 8 }}>
            How to use CENT
          </div>
          <ol
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
              paddingLeft: 16,
              display: "grid",
              gap: 6,
            }}
          >
            <li>Deposit BTC or stablecoins and mint CENT.</li>
            <li>Earn boost rewards by staking CENT in Medici Earn.</li>
            <li>Shop partner experiences or redeem hardware bundles.</li>
            <li>Track your spending and rewards on the Portfolio page.</li>
          </ol>
        </div>
      </div>
    </>
  )
}
