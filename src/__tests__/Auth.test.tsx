import { render, screen } from "@testing-library/react"
import App from "../App"

test("Header shows Connect button when not authenticated", async () => {
  render(<App />)
  const connect = await screen.findAllByText(/Connect/i)
  expect(connect.length).toBeGreaterThan(0)
})

test("Swap page shows Connect Wallet CTA when not connected", async () => {
  window.history.pushState({}, "", "/swap")
  render(<App />)
  const connectWallet = await screen.findAllByText(/Connect Wallet/i)
  expect(connectWallet.length).toBeGreaterThan(0)
})



