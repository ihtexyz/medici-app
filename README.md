# Medici - Bitcoin Banking App

Professional Bitcoin wealth management powered by Venice Fi. Borrow against your Bitcoin, earn yield on stablecoins, and swap across chains.

![Medici App](./public/MEDICI.png)

**Live App**: [cozy-yeot-1f174d.netlify.app](https://cozy-yeot-1f174d.netlify.app) | **Landing Page**: [github.com/Venicefi/medici-landing](https://github.com/Venicefi/medici-landing)

## 🎨 Design

Figma-inspired design system with clean Coinbase-style UI:
- **Colors**: `#FF9500` (orange), `#00DAFF` (blue)
- **Mobile-first** responsive design
- **Pure black** backgrounds (#000000)
- **SF Pro Display** typography

## ✨ Features

### 🏦 Borrow
Collateralized loans using Bitcoin as collateral, powered by **CENT Protocol** (Liquity v2 fork):
- **Multi-collateral**: Support for WBTC and cbBTC
- **User-set interest rates**: Choose your own borrowing rate (0.5% - 100%)
- **NFT-based positions**: Troves are transferable NFTs
- **No liquidation if CR > MCR**: Maintain 110%+ collateral ratio
- **Simple interest**: Non-compounding interest with 7-day adjustment cooldown

See [CENT_PROTOCOL.md](./CENT_PROTOCOL.md) for complete protocol guide.

### 📈 Earn
Deposit CENT into Stability Pools to earn yield:
- **Liquidation gains**: Receive collateral from liquidated positions at discount
- **Interest yield**: Earn portion of interest paid by borrowers
- **Multi-collateral pools**: Separate pools for WBTC and cbBTC
- **No lock-up**: Withdraw anytime with instant liquidity
- **Auto-compounding**: Option to compound yield gains back into deposit

### 🔄 Convert
Cross-chain token swaps powered by SwapKit (Bitcoin, Ethereum, Solana, and more)

### 🌐 ICP Integration (Planned)
Native Bitcoin support via Internet Computer Protocol:
- **ckBTC Integration**: Chain-Key Bitcoin for true decentralized BTC
- **No bridge risk**: Direct protocol-level Bitcoin integration
- **Fast & cheap**: 2-second finality, ~$0.0001 fees
- **1:1 backed**: Each ckBTC backed by real Bitcoin
- **Future collateral**: Will support ckBTC as collateral type

See [ICP_INTEGRATION.md](./ICP_INTEGRATION.md) for implementation roadmap.

### 🏦 Bank (New!)
Real banking powered by Bitcoin via Bridge.xyz:
- **Virtual USD Bank Accounts** with routing numbers
- **Virtual Payment Cards** for spending anywhere
- **On-Ramp**: Convert USD → USDC → CENT
- **Off-Ramp**: Cash out CENT → USD
- **Cross-Border Payments** at low fees
- **Send Money** via ACH/Wire transfers

See [BRIDGE_SETUP.md](./BRIDGE_SETUP.md) for configuration guide.

### 💼 Portfolio
View all your assets, transactions, and balances in one place

### ⚙️ Settings
Account management, network info, contacts, and preferences

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Blockchain
VITE_RPC_URL=https://arb-sepolia.g.alchemy.com/v2/your-key
VITE_CHAIN_ID=421614

# Authentication (Reown AppKit)
VITE_REOWN_PROJECT_ID=your_reown_project_id
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# SwapKit (Cross-chain swaps)
VITE_SWAPKIT_API_KEY=your_swapkit_api_key
VITE_SWAPKIT_PROJECT_ID=medici-prod

# Bridge.xyz (Banking)
VITE_BRIDGE_API_KEY=your_bridge_api_key
VITE_BRIDGE_BASE_URL=https://api.bridge.xyz/v0
VITE_BRIDGE_ENVIRONMENT=sandbox

# App Configuration
VITE_APP_NAME=Medici by Venice Fi
VITE_APP_URL=https://app.medicibtc.com
```

**Bridge Setup**: See [BRIDGE_SETUP.md](./BRIDGE_SETUP.md) for detailed banking integration guide.

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Design System (Coinbase-inspired)
- **Authentication**: Reown AppKit (wallet, email, social login)
- **Blockchain**: Wagmi + Viem (Ethereum/Arbitrum)
- **Lending Protocol**: CENT (Liquity v2 fork on Arbitrum)
- **Swaps**: SwapKit (cross-chain)
- **Banking**: Bridge.xyz (virtual accounts, cards, on/off-ramp)
- **State**: React Context + React Query

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete system architecture.**

## 📱 Pages

- `/` - Dashboard (overview, positions, balance)
- `/borrow` - Collateralized loans against Bitcoin
- `/earn` - Stability pools (earn yield + rewards)
- `/rewards` - Claim CENT token rewards
- `/bank` - Virtual accounts, cards, on/off-ramp (Bridge)
- `/swap` - Cross-chain token swaps (SwapKit)
- `/portfolio` - Asset management & history
- `/settings` - Account settings & preferences

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture and data flows
- **[CENT_PROTOCOL.md](./CENT_PROTOCOL.md)** - Detailed guide to the CENT lending protocol
- **[BRIDGE_SETUP.md](./BRIDGE_SETUP.md)** - Banking integration setup and configuration
- **[ICP_INTEGRATION.md](./ICP_INTEGRATION.md)** - Internet Computer Protocol & ckBTC integration guide
- **[FEATURE_COMPARISON.md](./FEATURE_COMPARISON.md)** - Comparison with USDaf-v2 and feature parity analysis
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Change history and improvements log

## 🎨 Design System

### Colors
```css
--cb-orange: #FF9500;      /* Primary */
--cb-blue: #00DAFF;        /* Secondary */
--cb-black: #000000;       /* Background */
--cb-card-bg: #1C1C1E;     /* Cards */
--cb-green: #32D74B;       /* Success */
--cb-red: #FF453A;         /* Error */
```

### Components
- Buttons: `.cb-btn`, `.cb-btn-primary`, `.cb-btn-secondary`
- Cards: `.cb-card`, `.cb-card-gradient`
- Typography: `.cb-title`, `.cb-headline`, `.cb-body`, `.cb-caption`
- Inputs: `.cb-input`

## 📦 Deployment

### Netlify (Recommended)
```bash
netlify deploy --prod --dir=dist
```

### Vercel
```bash
vercel --prod
```

### Docker
```bash
docker build -t medici-app .
docker run -p 3000:80 medici-app
```

## 🔧 Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

## 📄 License

Proprietary - Venice Fi

## 🤝 Support

For support, email support@venicefi.com or visit [venicefi.com](https://venicefi.com)

---

Built with ❤️ by [Venice Fi](https://venicefi.com)
