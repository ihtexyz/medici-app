# Bridge.xyz Integration Setup Guide

## Overview

Medici integrates with Bridge.xyz to provide Bitcoin banking features:
- **Virtual USD Bank Accounts** with routing numbers for receiving deposits
- **Virtual Payment Cards** for spending anywhere
- **On-Ramp**: USD → USDC → CENT conversion
- **Off-Ramp**: CENT → USD withdrawal to bank accounts
- **Cross-Border Payments** at low fees

## Architecture

### Customer-First Flow

Bridge uses a hierarchical structure:
```
Customer (KYC entity)
  └── Virtual Accounts (USD deposit → Crypto destination)
  └── Cards (spending instruments)
  └── External Accounts (withdrawal destinations)
```

### How It Works

1. **User connects wallet** → App creates Bridge Customer automatically
2. **Customer ID cached** in localStorage per wallet address
3. **Virtual Account creation** links fiat deposits to user's blockchain address
4. **Deposits** convert USD → USDC automatically and send to wallet
5. **Withdrawals** convert CENT → USD and send to bank account

## Environment Configuration

### Required Environment Variables

Add to `.env` file:

```bash
# Bridge API Configuration
VITE_BRIDGE_API_KEY=your_api_key_here
VITE_BRIDGE_BASE_URL=https://api.bridge.xyz/v0
VITE_BRIDGE_ENVIRONMENT=sandbox # or 'production'
```

### Getting API Keys

1. Visit [Bridge Dashboard](https://dashboard.bridge.xyz/app/keys)
2. Create **Sandbox** key for development
3. Create **Production** key when ready for live transactions
4. **Critical**: Keys are shown only once - save immediately!

### Security Notes

- **Never commit** API keys to git
- Add `.env` to `.gitignore`
- Sandbox keys are developer-scoped (not shared with team)
- Production keys require proper access controls

## API Endpoints

### Base URL

- **Production**: `https://api.bridge.xyz/v0`
- **Sandbox**: `https://api.bridge.xyz/v0` (same endpoint, different keys)

### Authentication

All requests require the `Api-Key` header:

```typescript
headers: {
  "Api-Key": "your_api_key",
  "Content-Type": "application/json",
  "Idempotency-Key": "unique_key" // For POST/PUT requests
}
```

### Key Endpoints Used

| Resource | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| Customers | `/customers` | POST | Create user profile |
| Customers | `/customers` | GET | List all customers |
| Virtual Accounts | `/customers/{id}/virtual_accounts` | POST | Create deposit account |
| Virtual Accounts | `/virtual_accounts` | GET | List all accounts |
| Cards | `/cards` | POST | Issue virtual card |
| Cards | `/cards/{id}/freeze` | POST | Freeze card |

## Integration Flow

### 1. Customer Creation

When a user connects their wallet, the app automatically:

```typescript
// src/hooks/useBridgeCustomer.ts
const response = await createCustomer({
  type: "individual",
  first_name: "User",
  last_name: walletAddress.slice(2, 8),
  email: `${walletAddress}@medici.app`,
})

// Store customer ID for future use
localStorage.setItem(`bridge_customer_${address}`, customerId)
```

### 2. Virtual Account Creation

User clicks "Create Bank Account":

```typescript
const response = await createVirtualAccount(customerId, {
  source: {
    currency: "usd",
    rail: "ach", // ACH deposits
  },
  destination: {
    currency: "usdc", // Receive as USDC
    payment_rail: "base", // Base network
    address: userWalletAddress, // User's wallet
  },
})
```

**Result**: User receives:
- Routing number
- Account number
- Can receive USD deposits → auto-converted to USDC → sent to wallet

### 3. Card Issuance

User clicks "Create Card":

```typescript
const response = await createCard({
  account_id: primaryAccount.id,
  card_type: "virtual",
  cardholder_name: "User Name",
  spending_limits: {
    daily: 1000,
    monthly: 5000,
    per_transaction: 500,
  },
})
```

## Payment Flows

### On-Ramp (Buy CENT)

User flow: USD in virtual account → USDC → swap to CENT

```typescript
const response = await onRamp({
  from_currency: "usd",
  to_currency: "usdc",
  from_amount: 100,
  destination_address: userWallet,
  source_account_id: virtualAccountId,
})

// Then swap USDC → CENT using DEX
```

### Off-Ramp (Cash Out)

User flow: CENT → USDC → USD in virtual account

```typescript
// 1. Swap CENT → USDC using DEX
// 2. Off-ramp USDC → USD
const response = await offRamp({
  from_currency: "usdc",
  to_currency: "usd",
  from_amount: 100,
  destination_account_id: virtualAccountId,
})
```

### Cross-Border Payments

Send USD internationally with low fees:

```typescript
const response = await crossBorderPayment({
  from_currency: "usd",
  to_currency: "eur",
  amount: 1000,
  source_account_id: virtualAccountId,
  recipient_details: {
    name: "Recipient Name",
    iban: "DE89370400440532013000",
    swift_code: "COBADEFF",
  },
})
```

## UI/UX Implementation

### Bank Page Structure

```
/bank
├── Header (balance overview)
├── Virtual Account Section
│   ├── Create Account (if none exists)
│   └── Account Details (routing, account #, balance)
├── Virtual Card Section
│   ├── Create Card (if none exists)
│   └── Card Display (gradient card UI)
├── Quick Actions Grid
│   ├── Buy CENT (on-ramp)
│   ├── Cash Out (off-ramp)
│   ├── Send Money (ACH/Wire)
│   └── Global Pay (cross-border)
└── Modal Flows (for each action)
```

### Key Components

- **src/hooks/useBridgeCustomer.ts**: Manages Bridge customer lifecycle
- **src/hooks/useBridgeAccount.ts**: Loads virtual accounts
- **src/hooks/useBridgeCards.ts**: Loads payment cards
- **src/services/bridge.ts**: All API interactions
- **src/pages/Bank.tsx**: Main UI

## Testing

### Sandbox Mode

1. Set `VITE_BRIDGE_ENVIRONMENT=sandbox`
2. Use sandbox API key
3. Test all flows without real money
4. Bridge provides test routing/account numbers

### Test Scenarios

- ✅ Connect wallet → Customer auto-created
- ✅ Create virtual account → Receive routing/account numbers
- ✅ Create virtual card → Receive card details
- ✅ Test freeze/unfreeze card
- ✅ Simulate deposits (via Bridge dashboard)
- ✅ Test on-ramp/off-ramp flows

## Production Checklist

Before going live:

- [ ] KYC implementation for real user data
- [ ] Terms of Service acceptance flow
- [ ] Production API key configured
- [ ] Webhook handlers for transaction updates
- [ ] Error monitoring and alerts
- [ ] Compliance with financial regulations
- [ ] Security audit of API key storage
- [ ] Rate limiting and request throttling
- [ ] Transaction history and receipts
- [ ] Customer support integration

## KYC Requirements

For production, Bridge requires:

### Individual Customers
- Full legal name
- Date of birth (18+)
- Residential address
- Email and phone
- Government ID (passport, driver's license)
- Proof of address
- Account purpose
- Source of funds

### Business Customers
- Business legal name
- Business type (LLC, corporation, etc.)
- EIN/Tax ID
- Business address
- Industry classification
- Associated persons
- Beneficial ownership information

## Compliance

Bridge handles:
- ✅ AML/KYC verification
- ✅ Transaction monitoring
- ✅ Regulatory reporting
- ✅ Sanctions screening

Your responsibilities:
- ⚠️ Collect accurate user information
- ⚠️ Display Terms of Service
- ⚠️ Handle customer support
- ⚠️ Report suspicious activity

## Supported Features

### Currencies

**Fiat**: USD, EUR, MXN
**Crypto**: USDC, USDT, DAI, EURC, PYUSD

### Payment Rails

**Fiat**: ACH, Wire, SEPA, SPEI, PIX
**Crypto**: Arbitrum, Base, Ethereum, Polygon, Solana, Avalanche

### Deposit Methods

- ACH Push (US)
- Wire Transfer (US)
- SEPA (Europe)
- SPEI (Mexico)
- PIX (Brazil)

## Limitations

### Sandbox
- No real money transfers
- Limited test data
- May not reflect production latency

### Production
- KYC approval required (can take days)
- Minimum/maximum transaction limits
- Geographic restrictions
- Compliance holds possible

## Webhooks (Future Enhancement)

Bridge sends webhooks for:
- Deposit received
- Transfer completed
- Card transaction
- KYC status change
- Account frozen/unfrozen

Implementation guide: See `BRIDGE_WEBHOOKS.md` (to be created)

## Monitoring

### Key Metrics to Track

- Customer creation success rate
- Virtual account activation time
- Deposit processing time
- Failed transactions (by reason)
- Card transaction volume
- Fraud/chargebacks

### Dashboard Access

- [Bridge Dashboard](https://dashboard.bridge.xyz/)
- View all customers, accounts, transactions
- Download reports
- Manage API keys
- Configure webhooks

## Support

- **Documentation**: https://apidocs.bridge.xyz
- **Dashboard**: https://dashboard.bridge.xyz
- **Status Page**: Check for API outages
- **Support**: Contact via Bridge dashboard

## Next Steps

1. ✅ Get sandbox API key
2. ✅ Add to `.env` file
3. ✅ Test customer creation
4. ✅ Test virtual account creation
5. ✅ Test card issuance
6. ⏳ Implement proper KYC flow
7. ⏳ Add transaction history
8. ⏳ Set up webhooks
9. ⏳ Security audit
10. ⏳ Production deployment
