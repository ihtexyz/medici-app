/**
 * Bridge.xyz API TypeScript Types
 * API Documentation: https://apidocs.bridge.xyz
 */

// Common types
export type BridgeEnvironment = 'sandbox' | 'production'

export type PaymentRail = 'ach' | 'wire' | 'card' | 'ethereum' | 'polygon' | 'arbitrum' | 'bitcoin'

export type Currency = 'usd' | 'eur' | 'gbp' | 'mxn' | 'usdc' | 'usdt' | 'btc' | 'eth'

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

// Virtual Account types
export interface AccountOwner {
  first_name: string
  last_name: string
  email: string
  type: 'individual' | 'business'
  phone?: string
  dob?: string // YYYY-MM-DD
  address?: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  tax_id?: string // SSN or EIN
}

export interface VirtualAccount {
  id: string
  account_number: string
  routing_number: string
  account_owner: AccountOwner
  balance: number
  currency: Currency
  status: 'active' | 'frozen' | 'closed'
  created_at: string
  iban?: string // For international accounts
  swift_code?: string
}

export interface CreateVirtualAccountRequest {
  account_owner: AccountOwner
  currency?: Currency
}

export interface VirtualAccountTransaction {
  id: string
  account_id: string
  type: 'credit' | 'debit'
  amount: number
  currency: Currency
  status: TransactionStatus
  description: string
  counterparty?: {
    name: string
    account_number?: string
  }
  created_at: string
  settled_at?: string
}

// Card types
export interface PaymentCard {
  id: string
  account_id: string
  card_number: string // Masked: •••• •••• •••• 1234
  expiry_month: string
  expiry_year: string
  cvv?: string // Only returned on creation
  cardholder_name: string
  card_type: 'virtual' | 'physical'
  brand: 'visa' | 'mastercard'
  status: 'active' | 'frozen' | 'cancelled'
  spending_limits: {
    daily: number
    weekly?: number
    monthly: number
    per_transaction?: number
  }
  balance: number
  created_at: string
}

export interface CreateCardRequest {
  account_id: string
  card_type: 'virtual' | 'physical'
  cardholder_name: string
  spending_limits: {
    daily: number
    monthly: number
    per_transaction?: number
  }
  billing_address?: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export interface CardTransaction {
  id: string
  card_id: string
  merchant_name: string
  merchant_category: string
  amount: number
  currency: Currency
  status: TransactionStatus
  type: 'authorization' | 'capture' | 'refund'
  created_at: string
}

// Payment types
export interface PaymentSource {
  payment_rail: PaymentRail
  account_id?: string
  address?: string // For crypto
  currency?: Currency
}

export interface PaymentDestination {
  payment_rail: PaymentRail
  account_id?: string
  address?: string // For crypto
  currency?: Currency
  bank_account?: {
    account_number: string
    routing_number: string
    account_holder_name: string
  }
  country?: string
}

export interface OnRampRequest {
  source: PaymentSource
  destination: PaymentDestination
  amount: number
  source_currency?: Currency
  destination_currency?: Currency
}

export interface OffRampRequest {
  source: PaymentSource
  destination: PaymentDestination
  amount: number
  source_currency?: Currency
  destination_currency?: Currency
}

export interface CrossBorderPaymentRequest {
  source_account_id: string
  destination: {
    country: string
    currency: Currency
    bank_account: {
      account_number: string
      routing_number?: string
      iban?: string
      swift_code?: string
      account_holder_name: string
    }
  }
  amount: number
  purpose?: string
  reference?: string
}

export interface RecurringPaymentRequest {
  source_account_id: string
  destination: PaymentDestination
  amount: number
  currency: Currency
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  start_date: string // YYYY-MM-DD
  end_date?: string // YYYY-MM-DD
  description?: string
}

export interface Payment {
  id: string
  source: PaymentSource
  destination: PaymentDestination
  amount: number
  source_currency: Currency
  destination_currency: Currency
  exchange_rate?: number
  fees: number
  status: TransactionStatus
  created_at: string
  completed_at?: string
  failure_reason?: string
}

// KYC types
export interface KYCRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  dob: string // YYYY-MM-DD
  ssn: string // Last 4 digits or full
  address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  document?: {
    type: 'passport' | 'drivers_license' | 'national_id'
    number: string
    country: string
    expiry_date?: string
  }
}

export interface KYCStatus {
  user_id: string
  status: 'pending' | 'approved' | 'rejected' | 'requires_review'
  verification_level: 'basic' | 'intermediate' | 'advanced'
  verified_at?: string
  rejection_reason?: string
  limits: {
    daily_transaction_limit: number
    monthly_transaction_limit: number
    max_balance: number
  }
}

// Response types
export interface BridgeApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    per_page: number
    has_more: boolean
  }
}

// Webhook types
export interface WebhookEvent {
  id: string
  type: 'transaction.created' | 'transaction.completed' | 'card.spent' | 'account.funded' | 'kyc.completed'
  data: Record<string, any>
  created_at: string
}
