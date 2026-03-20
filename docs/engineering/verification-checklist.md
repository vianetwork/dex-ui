# Verification Checklist

## Run the smallest relevant verification step

- `yarn lint`
- `source /home/romano/.nvm/nvm.sh && nvm use 20 && yarn tsc --noEmit`
- `yarn test`
- `yarn integration-test`

Choose the narrowest useful step for the change, then expand verification when
the affected area is high-risk.

## Wallet and session checks

Before finishing wallet/session work, verify as many of these as possible:

- disconnect clears app-local wallet session state
- eager reconnect respects persisted session intent
- provider account changes update the app account state
- zero exposed injected accounts deactivates the app session
- no connector-specific teardown is buried in presentational UI unnecessarily
- TypeScript passes for touched wallet/session files

If browser verification is available, test both:

1. app-triggered switch or disconnect
2. manual account changes in the wallet while the app is open

## Via-sensitive checks

For Via deployment and config changes, verify:

- addresses still resolve from the intended artifact source
- chain IDs remain correct for mainnet and testnet
- explorer links still point to the correct Via explorer
- BTC branding remains consistent in touched UI