# QA Plan (v0.1.0)

## Browsers & Devices
- Desktop: Chrome, Brave, Safari (latest), Firefox
- Mobile: iOS Safari (via WalletConnect), Android Chrome

## Wallets
- MetaMask (desktop), Rainbow extension
- Rainbow mobile via WalletConnect

## Flows
- Overview loads without errors
- Connect wallet (success, reject, no provider)
- Earn: quote -> approve (if CENT/USDC) -> submit -> tx link -> activity entry
- Borrow: quote -> approve WBTC -> submit -> tx link -> activity entry
- Rewards: fetch payload (no claim, has claim), claim -> tx link
- Portfolio: offers/demands list; cancel actions update UI
- Swap: quote BTC->ZEC (prototype), EVM->EVM with token select, approve path, insufficient balance state
- Pay: select contact -> quote -> send (prototype)

## Edge Cases
- Missing env vars (guardrails)
- Insufficient token allowance and balance
- RPC failure, transient network error
- Wallet change account/chain during flows

## Non-Functional
- Performance: initial route code split; basic sanity on devtools performance
- Monitoring: ensure client errors POST when DSN provided
- Accessibility: focus order for primary buttons; labels on inputs

## Acceptance
- All unit tests green, manual sanity completed on Chrome + MetaMask



