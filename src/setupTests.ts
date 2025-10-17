import "@testing-library/jest-dom"
import React from "react"

// Mock import.meta for Jest
Object.defineProperty(global, "import", {
  value: {
    meta: {
      env: {
        VITE_RPC_URL: "https://test-rpc.com",
        VITE_CENT_ADDRESS: "0x1234567890123456789012345678901234567890",
        VITE_CENT_REWARD_ADDRESS: "0x0987654321098765432109876543210987654321",
        VITE_MARKET_ID: "test-market",
        VITE_SWAPKIT_API_KEY: "test-key",
        VITE_SWAPKIT_PROJECT_ID: "test-project",
        VITE_APP_NAME: "Test Medici",
        VITE_WALLETCONNECT_PROJECT_ID: "test-wc-id"
      }
    }
  },
  writable: true
})

// Mock getEnv function
jest.mock("./lib/runtime-env", () => {
  const testDefaults: Record<string, string> = {
    VITE_RPC_URL: "https://test-rpc.com",
    VITE_CENT_ADDRESS: "0x1234567890123456789012345678901234567890",
    VITE_CENT_REWARD_ADDRESS: "0x0987654321098765432109876543210987654321",
    VITE_MARKET_ID: "test-market",
    VITE_SWAPKIT_API_KEY: "test-key",
    VITE_SWAPKIT_PROJECT_ID: "test-project",
    VITE_APP_NAME: "Test Medici",
    VITE_WALLETCONNECT_PROJECT_ID: "test-wc-id"
  }
  return {
    getEnv: jest.fn((key: string) => testDefaults[key] || ""),
    getEnvOptional: jest.fn((key: string) => testDefaults[key]),
  }
})

// Mock ESM-only Reown modules for Jest
jest.mock("@reown/appkit/react", () => {
  return {
    // Minimal createAppKit mock returning a modal-like object
    createAppKit: jest.fn(() => ({
      open: jest.fn(),
    })),
    useAppKit: jest.fn(() => ({ open: jest.fn() })),
    useAppKitAccount: jest.fn(() => ({ address: undefined, isConnected: false })),
  }
})

jest.mock("@reown/appkit-adapter-wagmi", () => {
  return {
    WagmiAdapter: class {
      wagmiConfig = {}
      constructor(_: unknown) {}
    },
  }
})

jest.mock("@reown/appkit/networks", () => {
  return {
    arbitrumSepolia: { id: 421614, name: "arbitrum-sepolia" },
  }
})

// Mock wagmi (ESM) for Jest
jest.mock("wagmi", () => {
  return {
    WagmiProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  }
})
