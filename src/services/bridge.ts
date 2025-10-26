/**
 * Bridge.xyz API Service
 * Handles all Bridge API interactions
 */

import { getEnvOptional as getEnv } from "../lib/runtime-env"
import type {
  BridgeApiResponse,
  VirtualAccount,
  CreateVirtualAccountRequest,
  VirtualAccountTransaction,
  PaymentCard,
  CreateCardRequest,
  CardTransaction,
  OnRampRequest,
  OffRampRequest,
  CrossBorderPaymentRequest,
  RecurringPaymentRequest,
  Payment,
  KYCRequest,
  KYCStatus,
  PaginatedResponse,
} from "../types/bridge"

const BRIDGE_API_KEY = getEnv("VITE_BRIDGE_API_KEY")
const BRIDGE_BASE_URL = getEnv("VITE_BRIDGE_BASE_URL") || "https://api.bridge.xyz/v0"
const BRIDGE_ENV = getEnv("VITE_BRIDGE_ENVIRONMENT") || "sandbox"

// Generate idempotency key for requests
function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

class BridgeClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || BRIDGE_API_KEY || ""
    this.baseUrl = baseUrl || BRIDGE_BASE_URL

    if (!this.apiKey) {
      console.warn("⚠️ Bridge API key not configured. Payment features will be in mock mode.")
    }

    if (BRIDGE_ENV === "sandbox") {
      console.log("🔧 Bridge running in SANDBOX mode")
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresIdempotency = false
  ): Promise<BridgeApiResponse<T>> {
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          code: "NO_API_KEY",
          message: "Bridge API key not configured. Please add VITE_BRIDGE_API_KEY to .env",
        },
      }
    }

    try {
      const headers: Record<string, string> = {
        "Api-Key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers as Record<string, string>,
      }

      // Add Idempotency-Key for POST/PUT requests to prevent duplicate operations
      if (requiresIdempotency && (options.method === "POST" || options.method === "PUT")) {
        headers["Idempotency-Key"] = generateIdempotencyKey()
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || "API_ERROR",
            message: data.error?.message || data.message || "An error occurred",
            details: data.error?.details,
          },
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network request failed",
        },
      }
    }
  }

  // Customers
  async createCustomer(request: {
    type: "individual" | "business"
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    birth_date?: string
    signed_agreement_id?: string
    residential_address?: {
      street_line_1: string
      city: string
      country: string
      postal_code?: string
      subdivision?: string
    }
  }): Promise<BridgeApiResponse<any>> {
    return this.request<any>("/customers", {
      method: "POST",
      body: JSON.stringify(request),
    }, true)
  }

  async listCustomers(): Promise<BridgeApiResponse<any>> {
    return this.request<any>("/customers")
  }

  async getCustomer(customerId: string): Promise<BridgeApiResponse<any>> {
    return this.request<any>(`/customers/${customerId}`)
  }

  // Virtual Accounts
  async createVirtualAccount(
    customerId: string,
    request: {
      source: { currency: string; rail?: string }
      destination: { currency: string; payment_rail?: string; address?: string }
      developer_fee_percent?: number
    }
  ): Promise<BridgeApiResponse<VirtualAccount>> {
    return this.request<VirtualAccount>(`/customers/${customerId}/virtual_accounts`, {
      method: "POST",
      body: JSON.stringify(request),
    }, true)
  }

  async listVirtualAccounts(params?: {
    status?: "activated" | "deactivated"
    limit?: number
    starting_after?: string
    ending_before?: string
  }): Promise<BridgeApiResponse<PaginatedResponse<VirtualAccount>>> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.set("status", params.status)
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.starting_after) queryParams.set("starting_after", params.starting_after)
    if (params?.ending_before) queryParams.set("ending_before", params.ending_before)

    const query = queryParams.toString()
    return this.request<PaginatedResponse<VirtualAccount>>(
      `/virtual_accounts${query ? `?${query}` : ""}`
    )
  }

  async getVirtualAccount(accountId: string): Promise<BridgeApiResponse<VirtualAccount>> {
    return this.request<VirtualAccount>(`/virtual_accounts/${accountId}`)
  }

  async getVirtualAccountTransactions(
    accountId: string,
    page = 1,
    perPage = 20
  ): Promise<BridgeApiResponse<PaginatedResponse<VirtualAccountTransaction>>> {
    return this.request<PaginatedResponse<VirtualAccountTransaction>>(
      `/virtualaccounts/${accountId}/transactions?page=${page}&per_page=${perPage}`
    )
  }

  // Cards
  async createCard(request: CreateCardRequest): Promise<BridgeApiResponse<PaymentCard>> {
    return this.request<PaymentCard>("/cards", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async listCards(): Promise<BridgeApiResponse<PaginatedResponse<PaymentCard>>> {
    return this.request<PaginatedResponse<PaymentCard>>("/cards")
  }

  async getCard(cardId: string): Promise<BridgeApiResponse<PaymentCard>> {
    return this.request<PaymentCard>(`/cards/${cardId}`)
  }

  async freezeCard(cardId: string): Promise<BridgeApiResponse<PaymentCard>> {
    return this.request<PaymentCard>(`/cards/${cardId}/freeze`, {
      method: "POST",
    })
  }

  async unfreezeCard(cardId: string): Promise<BridgeApiResponse<PaymentCard>> {
    return this.request<PaymentCard>(`/cards/${cardId}/unfreeze`, {
      method: "POST",
    })
  }

  async getCardTransactions(
    cardId: string,
    page = 1,
    perPage = 20
  ): Promise<BridgeApiResponse<PaginatedResponse<CardTransaction>>> {
    return this.request<PaginatedResponse<CardTransaction>>(
      `/cards/${cardId}/transactions?page=${page}&per_page=${perPage}`
    )
  }

  // Payments
  async onRamp(request: OnRampRequest): Promise<BridgeApiResponse<Payment>> {
    return this.request<Payment>("/wallets/onramp", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async offRamp(request: OffRampRequest): Promise<BridgeApiResponse<Payment>> {
    return this.request<Payment>("/wallets/offramp", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async crossBorderPayment(
    request: CrossBorderPaymentRequest
  ): Promise<BridgeApiResponse<Payment>> {
    return this.request<Payment>("/payments/cross-border", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async createRecurringPayment(
    request: RecurringPaymentRequest
  ): Promise<BridgeApiResponse<Payment>> {
    return this.request<Payment>("/payments/recurring", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async listPayments(
    page = 1,
    perPage = 20
  ): Promise<BridgeApiResponse<PaginatedResponse<Payment>>> {
    return this.request<PaginatedResponse<Payment>>(
      `/payments?page=${page}&per_page=${perPage}`
    )
  }

  async getPayment(paymentId: string): Promise<BridgeApiResponse<Payment>> {
    return this.request<Payment>(`/payments/${paymentId}`)
  }

  // KYC
  async submitKYC(request: KYCRequest): Promise<BridgeApiResponse<KYCStatus>> {
    return this.request<KYCStatus>("/kyc/submit", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async getKYCStatus(userId: string): Promise<BridgeApiResponse<KYCStatus>> {
    return this.request<KYCStatus>(`/kyc/status/${userId}`)
  }
}

// Export singleton instance
export const bridgeClient = new BridgeClient()

// Export individual functions for convenience
export const {
  createCustomer,
  listCustomers,
  getCustomer,
  createVirtualAccount,
  listVirtualAccounts,
  getVirtualAccount,
  getVirtualAccountTransactions,
  createCard,
  listCards,
  getCard,
  freezeCard,
  unfreezeCard,
  getCardTransactions,
  onRamp,
  offRamp,
  crossBorderPayment,
  createRecurringPayment,
  listPayments,
  getPayment,
  submitKYC,
  getKYCStatus,
} = bridgeClient
