import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import App from "../App"

// Ensure no SwapKit creds are present for this suite
jest.mock("../lib/runtime-env", () => {
  return {
    getEnv: jest.fn((key: string) => ""),
    getEnvOptional: jest.fn((key: string) => undefined),
  }
})

// Force wallet to be connected for these tests
jest.mock("@reown/appkit/react", () => {
  return {
    createAppKit: jest.fn(() => ({ open: jest.fn() })),
    useAppKit: jest.fn(() => ({ open: jest.fn() })),
    useAppKitAccount: jest.fn(() => ({ address: "0xabc", isConnected: true })),
  }
})

test("Swap shows mock-mode banner when SwapKit creds missing", async () => {
  window.history.pushState({}, "", "/swap")
  render(<App />)
  const banner = await screen.findByText(/Swaps are in mock mode/i)
  expect(banner).toBeInTheDocument()
})

test("Entering amount shows preview button enabled", async () => {
  window.history.pushState({}, "", "/swap")
  render(<App />)
  const input = await screen.findByPlaceholderText("0.0")
  await userEvent.type(input, "0.1")
  const btn = await screen.findByText(/Preview send/i)
  expect(btn).not.toBeDisabled()
})


