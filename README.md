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

### 💰 Buy
On/off ramp integration to purchase crypto with fiat using Coinbase Pay

### 🏦 Borrow
Collateralized loans using Bitcoin as collateral, powered by Venice Fi

### 📈 Earn
Deposit assets into Genesis Vaults to earn yield (BTC, USDC, USDT vaults)

### 🔄 Convert
Cross-chain token swaps powered by SwapKit (Bitcoin, Ethereum, Solana, and more)

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

# App Configuration
VITE_APP_NAME=Medici by Venice Fi
VITE_APP_URL=https://app.medicibtc.com
```

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Design System (Coinbase-inspired)
- **Authentication**: Reown AppKit (wallet, email, social login)
- **Blockchain**: Wagmi + Viem (Ethereum/Arbitrum)
- **Swaps**: SwapKit (cross-chain)
- **State**: React Context + React Query

## 📱 Pages

- `/` - Home (overview, balance, quick actions)
- `/buy` - On/off ramp for purchasing crypto
- `/borrow` - Collateralized loans
- `/invest` - Genesis Vaults (earn yield)
- `/swap` - Cross-chain token swaps
- `/portfolio` - Asset management
- `/pay` - Receive crypto/payments
- `/settings` - Account settings
- `/rewards` - Claim CENT tokens

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
