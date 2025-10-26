# Bridge.xyz Payment Integration Plan

## Overview
Integrate Bridge.xyz to enable real-world payments, virtual bank accounts, and cards powered by CENT stablecoin.

---

## 🎯 Core Features to Implement

### 1. **Virtual USD Accounts**
Users can create USD virtual accounts to:
- Receive ACH/wire transfers
- Hold USD balances
- Make domestic and international payments
- Connect to banking infrastructure

**API**: `/virtualaccounts/create`, `/virtualaccounts/list`

### 2. **Virtual Payment Cards**
Enable users to get virtual debit cards:
- Spend CENT anywhere Visa/Mastercard is accepted
- Virtual cards for online purchases
- Physical cards (future)
- Real-time spending notifications

**API**: `/cards/create`, `/cards/list`, `/cards/spend`

### 3. **On-Ramp (Fiat → Crypto)**
Users can buy CENT with:
- Bank transfers (ACH)
- Debit/credit cards
- Wire transfers

**API**: `/wallets/onramp`

### 4. **Off-Ramp (Crypto → Fiat)**
Users can cash out CENT to:
- Bank accounts
- Virtual accounts
- International recipients

**API**: `/wallets/offramp`

### 5. **Cross-Border Payments**
Send money globally:
- International wire transfers
- Lower fees than traditional banks
- Fast settlement
- Multiple currency support

**API**: `/payments/cross-border`

### 6. **Recurring Payments**
Set up automatic payments:
- Subscriptions
- Bill payments
- Salary payments

**API**: `/payments/recurring`

### 7. **Treasury Management**
For power users:
- Batch payments
- Liquidity management
- Multi-account setup
- Reporting and analytics

**API**: `/treasury/*`

---

## 🏗️ Architecture Plan

### Directory Structure
```
src/
├── services/
│   └── bridge.ts           # Bridge API client
├── hooks/
│   ├── useBridgeAccount.ts # Virtual account management
│   ├── useBridgeCards.ts   # Card management
│   └── useBridgePayments.ts # Payment operations
├── pages/
│   ├── Pay.tsx             # Main payments page
│   ├── Cards.tsx           # Card management
│   └── PaymentHistory.tsx  # Transaction history
├── components/
│   ├── VirtualAccountCard.tsx
│   ├── PaymentCardDisplay.tsx
│   └── PaymentFlows/
│       ├── SendMoney.tsx
│       ├── OnRamp.tsx
│       └── OffRamp.tsx
└── types/
    └── bridge.ts           # TypeScript types
```

### Environment Variables
```bash
# .env
VITE_BRIDGE_API_KEY=your_api_key_here
VITE_BRIDGE_BASE_URL=https://api.bridge.xyz
VITE_BRIDGE_ENVIRONMENT=sandbox # or production
```

---

## 📝 Implementation Phases

### **Phase 1: Foundation** (Day 1-2)
- [x] Create Bridge API service layer
- [x] Set up TypeScript types
- [x] Add environment configuration
- [ ] Create basic Payments page
- [ ] Add navigation link

### **Phase 2: Virtual Accounts** (Day 2-3)
- [ ] Implement account creation flow
- [ ] Display account details (routing number, account number)
- [ ] Show account balance
- [ ] Transaction history
- [ ] Fund account (on-ramp)

### **Phase 3: Payment Cards** (Day 3-4)
- [ ] Card creation flow
- [ ] Display card details (number, CVV, expiry)
- [ ] Card controls (freeze/unfreeze, limits)
- [ ] Transaction notifications
- [ ] Spending history

### **Phase 4: Payment Flows** (Day 4-5)
- [ ] Send money to bank account (off-ramp)
- [ ] Send money to other users
- [ ] Cross-border payments
- [ ] Payment scheduling
- [ ] Payment templates

### **Phase 5: Advanced Features** (Day 5-7)
- [ ] Recurring payments
- [ ] Multi-currency support
- [ ] Batch payments
- [ ] Analytics dashboard
- [ ] KYC flow integration
- [ ] 2FA for sensitive operations

---

## 🔐 Security Considerations

### API Key Management
```typescript
// Never expose API keys in frontend
// Use backend proxy for sensitive operations

// Frontend: Call your backend
const response = await fetch('/api/bridge/create-account', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
})

// Backend: Proxy to Bridge
const bridgeResponse = await fetch('https://api.bridge.xyz/virtualaccounts', {
  headers: {
    'Api-Key': process.env.BRIDGE_API_KEY
  }
})
```

### User Authentication
- Require wallet signature for account creation
- 2FA for high-value transactions
- Device fingerprinting for card operations
- Rate limiting on sensitive endpoints

### KYC/AML Compliance
Bridge requires KYC for:
- Virtual account creation (above certain limits)
- Card issuance
- Large transactions

**Implementation:**
1. Collect KYC data: Name, DOB, Address, SSN/Tax ID
2. Submit to Bridge KYC endpoint
3. Store KYC status in user profile
4. Gate features based on verification level

---

## 💳 User Flows

### Flow 1: Create Virtual Account
```
1. User clicks "Create Payment Account"
2. KYC check (if not verified)
3. Call Bridge API to create virtual account
4. Display account details:
   - Routing number: 084106768
   - Account number: 1234567890
   - Account type: Checking
5. User can now receive ACH transfers
```

### Flow 2: Get Virtual Card
```
1. User clicks "Get Card"
2. Verify virtual account exists
3. Choose card type (virtual/physical)
4. Set spending limits
5. Call Bridge API to create card
6. Display card details (masked)
7. User can add to Apple/Google Pay
```

### Flow 3: Send Money
```
1. User enters recipient details
2. Enter amount in USD
3. Preview fees and exchange rate
4. Confirm with wallet signature
5. Bridge converts CENT → USD
6. Sends via ACH/wire/international transfer
7. Show transaction receipt
```

### Flow 4: Cash Out (Off-Ramp)
```
1. User selects amount of CENT to sell
2. Choose destination:
   - Bank account
   - Virtual account
   - Debit card
3. Preview exchange rate and fees
4. Confirm transaction
5. Bridge liquidates CENT → USD
6. Transfers to destination
7. Show receipt and ETA
```

### Flow 5: Buy CENT (On-Ramp)
```
1. User enters USD amount
2. Choose funding source:
   - Bank account (ACH)
   - Debit/credit card
   - Wire transfer
3. Preview CENT amount and fees
4. Confirm purchase
5. Bridge processes payment
6. CENT deposited to wallet
7. Show receipt
```

---

## 🎨 UI Components

### Virtual Account Card
```typescript
<div className="cb-card">
  <h3>Virtual Bank Account</h3>
  <div>
    <label>Routing Number</label>
    <span>084106768</span>
  </div>
  <div>
    <label>Account Number</label>
    <span>•••• 7890</span>
  </div>
  <div>
    <label>Balance</label>
    <span>$1,234.56</span>
  </div>
  <button>Add Money</button>
  <button>Send Money</button>
</div>
```

### Payment Card Display
```typescript
<div className="payment-card">
  <div className="card-chip">💳</div>
  <div className="card-number">•••• •••• •••• 1234</div>
  <div className="card-details">
    <div>
      <label>Expires</label>
      <span>12/27</span>
    </div>
    <div>
      <label>CVV</label>
      <span>•••</span>
    </div>
  </div>
  <div className="card-name">John Doe</div>
  <div className="card-controls">
    <button>Freeze Card</button>
    <button>Set Limits</button>
  </div>
</div>
```

### Send Money Form
```typescript
<form>
  <input placeholder="Recipient Name" />
  <input placeholder="Bank Account or Email" />
  <input type="number" placeholder="Amount (USD)" />
  <select>
    <option>ACH (2-3 days) - Free</option>
    <option>Wire (Same day) - $25</option>
    <option>International - $15</option>
  </select>
  <button>Preview</button>
</form>
```

---

## 📊 Bridge API Endpoints to Use

### Virtual Accounts
```typescript
// Create account
POST /virtualaccounts
{
  "account_owner": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "type": "individual"
  }
}

// List accounts
GET /virtualaccounts

// Get account details
GET /virtualaccounts/{account_id}

// Get transactions
GET /virtualaccounts/{account_id}/transactions
```

### Cards
```typescript
// Create card
POST /cards
{
  "account_id": "va_123",
  "card_type": "virtual",
  "spending_limits": {
    "daily": 1000,
    "monthly": 5000
  }
}

// List cards
GET /cards

// Get card details
GET /cards/{card_id}

// Freeze/unfreeze card
POST /cards/{card_id}/freeze
POST /cards/{card_id}/unfreeze
```

### Payments
```typescript
// On-ramp (buy crypto)
POST /wallets/onramp
{
  "source": {
    "payment_rail": "ach",
    "account_id": "va_123"
  },
  "destination": {
    "payment_rail": "ethereum",
    "address": "0x...",
    "currency": "usdc"
  },
  "amount": 100
}

// Off-ramp (sell crypto)
POST /wallets/offramp
{
  "source": {
    "payment_rail": "ethereum",
    "address": "0x...",
    "currency": "usdc"
  },
  "destination": {
    "payment_rail": "ach",
    "account_id": "va_123"
  },
  "amount": 100
}

// Cross-border payment
POST /payments/cross-border
{
  "source_account_id": "va_123",
  "destination": {
    "country": "MX",
    "currency": "MXN",
    "bank_account": "..."
  },
  "amount": 100
}
```

---

## 🔄 Integration with Existing Features

### Dashboard Integration
```typescript
// Show payment account balance alongside CENT balance
<div className="balance-cards">
  <div className="cb-card">
    <label>CENT Balance</label>
    <span>${centBalance}</span>
  </div>
  <div className="cb-card">
    <label>USD Account</label>
    <span>${usdBalance}</span>
  </div>
</div>
```

### Navigation Update
```typescript
// Add "Pay" to bottom navigation
<NavLink to="/pay" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
  <span className="bottom-nav-icon">💸</span>
  <span>Pay</span>
</NavLink>
```

### More Menu Addition
```typescript
// Add card management to settings
<Link to="/cards" className="cb-card">
  <span>💳</span>
  <div>
    <div className="cb-body">Cards</div>
    <div className="cb-caption">Manage payment cards</div>
  </div>
  <span>→</span>
</Link>
```

---

## 🧪 Testing Strategy

### Sandbox Testing
Bridge provides sandbox environment:
```bash
VITE_BRIDGE_ENVIRONMENT=sandbox
VITE_BRIDGE_BASE_URL=https://sandbox-api.bridge.xyz
```

Test scenarios:
- [ ] Create virtual account
- [ ] Fund account with test ACH
- [ ] Create virtual card
- [ ] Make test purchases
- [ ] Off-ramp to test bank account
- [ ] Cross-border payment to test recipient
- [ ] Recurring payment setup
- [ ] Account freezing/unfreezing
- [ ] Transaction webhooks

### Production Testing
- [ ] Small real transactions
- [ ] KYC flow with real data
- [ ] Card issuance and activation
- [ ] Real bank transfers
- [ ] Customer support integration
- [ ] Compliance checks

---

## 📈 Business Metrics to Track

### User Adoption
- Virtual accounts created
- Cards issued
- Active payment users
- Average transaction value

### Transaction Volume
- Total USD processed
- On-ramp volume (fiat → CENT)
- Off-ramp volume (CENT → fiat)
- Cross-border payments
- Card spending

### Revenue Opportunities
- Transaction fees (0.5-1% per transaction)
- Card interchange fees
- Premium features (instant settlements, higher limits)
- Cross-border payment markup

---

## 🚀 Go-to-Market Features

### Launch Features (MVP)
1. ✅ Virtual USD account
2. ✅ Virtual debit card
3. ✅ Buy CENT with bank transfer
4. ✅ Sell CENT to bank account
5. ✅ Transaction history

### Phase 2 Features
6. Cross-border payments
7. Recurring payments
8. Physical cards
9. Multi-currency accounts
10. Payment scheduling

### Phase 3 Features
11. Business accounts
12. Team management
13. API for developers
14. White-label solutions
15. Institutional treasury

---

## 💡 Value Propositions

### For Users
- "Bank account powered by Bitcoin"
- "Spend your Bitcoin anywhere with a card"
- "Send money globally at crypto speed"
- "Earn yield while banking" (CENT in stability pools)

### Competitive Advantages
- **vs. Traditional Banks**: Higher yields, 24/7 access, global
- **vs. Crypto Apps**: Real banking features, easier fiat on/off-ramp
- **vs. Wise/Revolut**: Decentralized, Bitcoin-backed, DeFi integration

---

## 🔧 Next Steps

1. **Set up Bridge account**
   - Sign up at https://bridge.xyz
   - Complete KYC
   - Get API keys (sandbox + production)

2. **Backend setup** (if needed)
   - Create API proxy server
   - Secure API key storage
   - Webhook endpoint for transaction updates

3. **Frontend implementation**
   - Create Bridge service layer
   - Build Payments page UI
   - Implement account/card flows
   - Add payment features

4. **Testing**
   - Sandbox testing
   - Internal beta
   - Limited production rollout

5. **Launch**
   - Marketing campaign
   - User onboarding flow
   - Support documentation
   - Monitor metrics

---

**Ready to build when you share the API key!** 🚀

Let me know when you have the API key and I'll:
1. Set up the Bridge service layer
2. Create the Payments page
3. Implement virtual accounts
4. Build card management
5. Add payment flows
