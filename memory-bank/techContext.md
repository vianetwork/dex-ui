# Tech Context: Via DEX UI

## Technologies Used

### Core Framework
- **React 16.13.1** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Create React App** - Build tooling

### State Management
- **Redux** - Global state management
- **Redux Toolkit** - Redux utilities
- **React-Redux** - React bindings for Redux

### Web3 / Blockchain
- **ethers.js** - Ethereum library for contract interactions
- **zksync-ethers** - ZK Stack specific utilities (create2Address, etc.)
- **@web3-react/core** - Wallet connection abstraction
- **@uniswap/sdk** - Uniswap V2 SDK for swap calculations

### Wallet Connectors
- **@web3-react/injected-connector** - MetaMask and browser wallets
- **@web3-react/walletconnect-connector** - WalletConnect protocol
- **@web3-react/walletlink-connector** - Coinbase Wallet
- **@web3-react/fortmatic-connector** - Fortmatic
- **@web3-react/portis-connector** - Portis

### Wallet Session Management
- **useWalletSession hook** - Central lifecycle (connect, disconnect, switch)
- **sessionStorage.ts** - Versioned localStorage persistence
- **Web3ReactManager** - Eager reconnect on mount

### Styling
- **styled-components 4.2.0** - CSS-in-JS styling
- **polished** - Color manipulation utilities

### Internationalization
- **i18next 15.0.9** - Translation framework
- **react-i18next 10.7.0** - React bindings

### Testing
- **Cypress** - E2E testing
- **Jest** - Unit testing (via CRA)

### Build & Development
- **Yarn** - Package manager
- **ESLint 6.8.0** - Linting
- **Prettier 1.17.0** - Code formatting

## Development Setup

### Prerequisites
- Node.js (use nvm with node 20 for type checking)
- Yarn package manager

### Installation
```bash
yarn install
```

### Environment Variables
Create `.env` file based on `.env.production`:
```
REACT_APP_CHAIN_ID="25223"
REACT_APP_NETWORK_URL="https://via.testnet.viablockchain.dev"
REACT_APP_PORTIS_ID="<portis-id>"
REACT_APP_FORTMATIC_KEY="<fortmatic-key>"
REACT_APP_GOOGLE_ANALYTICS_ID="<ga-id>"
```

### Running Locally
```bash
yarn start
```

### Building for Production
```bash
yarn build
```

### Running Tests
```bash
# Type checking
source /home/romano/.nvm/nvm.sh && nvm use 20 && yarn tsc --noEmit

# E2E tests against a local production build
yarn integration-test

# Unit tests
yarn test

# Linting
yarn lint
```

## Technical Constraints

### Smart Contract Dependency
The DEX UI depends on external smart contract deployments and deployment
metadata. The checked-in Via testnet deployment artifact contains live addresses
for router, factory, multicall, WBTC, and pair bytecode hash. The frontend
depends on those contracts existing on-chain and on the artifact remaining
correct.

### Chain Compatibility
- Must work with Via Network's ZK Stack implementation
- Pair addresses calculated using `create2Address` from zksync-ethers
- Custom bytecode hash for pair creation (from deployment artifact)

### SDK Limitations
- Using `@uniswap/sdk` which expects Ethereum chain IDs
- Custom `ChainId` enum overrides SDK's enum
- Token instances cast `ChainId` to `any` for compatibility

### Wallet Session Constraints
- Injected provider state (`eth_accounts`, `accountsChanged`) is source of
  truth
- localStorage session is only local intent, not authoritative
- Disconnect and switch-account are semantically different operations
- `connect()` is optimistic - persists before activation succeeds
- WalletConnect requires explicit provider disconnect on teardown

### Browser Support
- Modern browsers with Web3 wallet support
- MetaMask, WalletConnect, Coinbase Wallet, etc.

### Network Requirements
- RPC endpoint: `https://via.testnet.viablockchain.dev`
- Chain ID: 25223 (testnet), 5223 (mainnet)

## Dependencies

### Key Production Dependencies
```json
{
  "@uniswap/sdk": "^3.0.3",
  "ethers": "^5.x",
  "zksync-ethers": "^5.x",
  "@web3-react/core": "^6.x",
  "react": "^16.13.1",
  "redux": "^4.x",
  "styled-components": "^4.2.0",
  "i18next": "^15.0.9"
}
```

### Key Dev Dependencies
```json
{
  "typescript": "^3.8.3",
  "cypress": "^4.11.0",
  "@types/react": "^16.9.34",
  "eslint": "^6.8.0",
  "prettier": "^1.17.0"
}
```

## Repo Workflow References

Repo-local Cline workflow guidance lives in:

- `.clinerules/CLINE-WORKFLOW.md` - Standardized Cline workflow for this repo
- `.clinerules/code-style.md` - TypeScript, React, naming, comments, formatting
- `.clinerules/implementation-docs.md` - Planning and execution order guidance
- `AGENTS.md` - Concise repo routing and non-negotiable rules
- `docs/engineering/` - Deep subsystem onboarding (7 playbooks)

Use these alongside the Memory Bank when planning or implementing changes. The
intended split is:

- `.clinerules/*` for workflow and authoring behavior
- `AGENTS.md` for concise repo routing and non-negotiable rules
- `docs/engineering/*` for deeper subsystem onboarding
- `memory-bank/*` for current project state

## Tool Usage Patterns

### Contract Interactions
```typescript
// Using ethers with zksync-ethers utilities
import { ethers } from "ethers";
import { create2Address } from "zksync-ethers/build/utils";

// Contract calls go through hooks
const contract = useContract(address, ABI);
await contract.someMethod(args);
```

### Wallet Session Operations
```typescript
// All wallet lifecycle through useWalletSession
const { connect, disconnect, switchInjectedAccount, canSwitchAccount } = useWalletSession();

// Connect (optimistic - saves to localStorage before activation)
connect('injected');

// Disconnect (full teardown)
disconnect();

// Switch account (injected wallets only)
if (canSwitchAccount) switchInjectedAccount();
```

### State Updates
```typescript
// Redux actions dispatched from hooks
dispatch(updateUserSlippageTolerance({ userSlippageTolerance: value }));
```

### Styling
```typescript
// Styled-components with theme
const Button = styled.button`
  background: ${({ theme }) => theme.primary1};
`;
```

## API Endpoints

### Via Network RPC
- **Testnet**: `https://via.testnet.viablockchain.dev`
- **Mainnet**: TBD

### Block Explorer
- **Testnet**: `https://testnet.blockscout.onvia.org` (from deployment artifact)

### Token Lists
- Custom token list configuration in `src/constants/lists.ts`
- Built-in tokens defined in `src/state/lists/hooks.ts`

## Deployment

### Build Output
- Static files in `build/` directory
- Can be deployed to any static hosting (Vercel, Netlify, IPFS, etc.)

### Environment-Specific Builds
- Production build uses `.env.production`
- Development uses `.env` (gitignored)

### Via Deployment Artifacts
- `src/via/deployments/via.deployments.testnet.json` - Testnet addresses
- Read by `src/via/deployments/getAddresses.ts` - Typed accessors
- Adding a new network: create a new artifact JSON, no code changes needed
