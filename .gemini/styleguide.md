# Code Style Guidelines — VIA Bridge Frontend

## Self-Review Requirement

After writing any code or implementation plan, **re-read this file and verify compliance before delivering**. Do not rely on memory - scan the output against each section below. The most commonly missed rules are: `any` vs `unknown`, `useMemo` for trivial logic, deep property chain extraction, and LLM-isms in comments.

## TypeScript

### Strict Typing
- Enable strict mode in `tsconfig.json`
- Avoid `any` type - use `unknown` if type is truly unknown
- Define interfaces for all props, state, and API responses
- Use type guards for runtime type checking

```typescript
// ❌ Bad
const handleData = (data: any) => { ... }

// ✅ Good
interface ApiResponse {
  success: boolean;
  data: TransactionData;
}
const handleData = (data: ApiResponse) => { ... }
```

### Type Definitions
- **Co-locate types by default** - Define types in the same file as the hook, component, or service that uses them
- **Extract to `src/types/` only when shared** - Move types to `src/types/` only when they are genuinely used across 2+ unrelated files
- Export types alongside their implementations (e.g., `export interface UseBalanceOptions`)
- For shared types, use barrel files (`index.ts`) for clean imports

```typescript
// ✅ Good - co-located with hook
// src/hooks/use-balance.ts
export interface UseBalanceOptions {
  address: string;
  decimals: number;
}

export interface BalanceState {
  balance: string | null;
  isLoading: boolean;
}

export function useBalance(options: UseBalanceOptions): BalanceState {
  // ...
}

// ✅ Good - shared type extracted (used by 3+ files)
// src/types/transaction.ts
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: string;
  status: TransactionStatus;
  timestamp: number;
  txHash: string;
}

export type TransactionStatus = 
  | 'Pending' 
  | 'InProgress' 
  | 'ExecutedOnL2' 
  | 'CommittedToL1' 
  | 'ProvedOnL1' 
  | 'ExecutedOnL1' 
  | 'Processed' 
  | 'Failed';

// ❌ Avoid - premature extraction
// Don't create src/types/balance.ts if only one hook uses it
```

### Enums vs Union Types
- Prefer union types for simple string literals
- Use enums only when you need reverse mapping or iteration

```typescript
// ✅ Preferred for simple cases
type BridgeMode = 'deposit' | 'withdraw';

// ✅ Use enum when needed
enum EthereumNetwork {
  MAINNET = 'mainnet',
  SEPOLIA = 'sepolia',
}
```

## Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `BridgeForm.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-network-switcher.ts`)
- Utils: `kebab-case.ts` (e.g., `wallet-errors.ts`)
- Types: `kebab-case.ts` (e.g., `transaction.ts`)
- Stores: `kebab-case-store.ts` (e.g., `wallet-store.ts`)

### Variables and Functions
- Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Functions: `camelCase` with verb prefix
- Boolean variables: `is`, `has`, `can`, `should` prefix

```typescript
// Variables
const userAddress = '0x...';
const isConnected = true;
const hasBalance = balance > 0;

// Constants
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://...';

// Functions
function fetchBalance() { ... }
function handleSubmit() { ... }
function validateAddress() { ... }
```

### DeFi/Vault Naming Conventions

When working with yield vaults and token conversions, use standard DeFi terminology:

| Term | Meaning | Example |
|------|---------|---------|
| `underlyingSymbol` | The actual asset deposited | "USDC", "USDT" |
| `vaultShareSymbol` | The vault token representing shares | "vUSDC", "vUSDT" |
| `inputAmount` | Amount being converted | User input value |
| `outputAmount` | Calculated result | Expected receive amount |
| `displayRate` | Formatted rate for UI | "0.9800" |
| `mode` | Bridge direction | "deposit" or "withdraw" |

**Vault Utility Functions:**

| Function | Purpose | File |
|----------|---------|------|
| `calculateVaultConversion` | Calculate conversion between underlying and vault shares | `vault-conversion.ts` |
| `formatVaultRate` | Format exchange rate for display | `vault-conversion.ts` |

```typescript
// ❌ Avoid vague names
function formatRate(baseSymbol: string, l2Symbol: string, direction: string) { ... }

// ✅ Use explicit DeFi terminology
function formatVaultRate(
  exchangeRate: string,
  underlyingSymbol: string,   // The actual asset (USDC)
  vaultShareSymbol: string,   // The vault token (vUSDC)
  mode: BridgeMode            // "deposit" or "withdraw"
): string { ... }
```

### Asset Configuration Naming

When defining asset configurations with vault addresses, use explicit network and vault type names:

| Property | Naming | Example |
|----------|--------|---------|
| Vault addresses container | `vaultAddresses` | Not `vaults` |
| Network keys | Explicit names | `ethereum`, `via` (not `l1`, `l2`) |
| Standard vault | `standard` | Not `normal` |
| Yield-bearing vault | `yieldBearing` | Not `yield` (reserved word) |

```typescript
// ❌ Avoid - generic layer names and reserved words
vaults: {
  l1: { normal: "0x...", yield: "0x..." },
  l2: { normal: "0x...", yield: "0x..." }
}

// ✅ Prefer - explicit network names and clear terminology
vaultAddresses: {
  ethereum: { standard: "0x...", yieldBearing: "0x..." },
  via: { standard: "0x...", yieldBearing: "0x..." }
}
```

**Why explicit network names:**
- `l1`/`l2` are ambiguous - which L1? which L2?
- `ethereum`/`via` are self-documenting
- Easier to extend when adding more networks

### Utility File Naming

Name utility files after their domain, not their implementation:

| ❌ Avoid | ✅ Prefer | Reason |
|----------|-----------|--------|
| `exchange-rate.ts` | `vault-conversion.ts` | Matches content (vault operations) |
| `format-utils.ts` | `vault-formatting.ts` | Specific to domain |
| `helpers.ts` | `bridge-helpers.ts` | Indicates what it helps with |
| `utils.ts` | `wallet-utils.ts` | Domain-specific naming |

### React Components
- Component names: `PascalCase`
- Props interfaces: `ComponentNameProps`
- Event handlers: `on` prefix for props, `handle` prefix for internal

```typescript
interface BridgeFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

function BridgeForm({ onSubmit, onCancel }: BridgeFormProps) {
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return <form onSubmit={handleFormSubmit}>...</form>;
}
```

## Imports

### Order
1. React and Next.js
2. Third-party libraries
3. Internal aliases (@/)
4. Relative imports
5. Types (with `type` keyword)

```typescript
// 1. React/Next
import { useState, useEffect } from 'react';
import Image from 'next/image';

// 2. Third-party
import { ethers } from 'ethers';
import { toast } from 'sonner';

// 3. Internal aliases
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/store/wallet-store';

// 4. Relative
import { formatAmount } from './utils';

// 5. Types
import type { Transaction } from '@/types/transaction';
```

### Path Aliases
- Always use `@/` alias for imports from `src/`
- Never use relative paths that go up more than one level

```typescript
// ❌ Bad
import { Button } from '../../../components/ui/button';

// ✅ Good
import { Button } from '@/components/ui/button';
```

## React Patterns

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';

// 2. Types
interface MyComponentProps {
  title: string;
}

// 3. Component
export function MyComponent({ title }: MyComponentProps) {
  // 3a. Hooks (in order: state, context, custom hooks, effects)
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useMyHook();
  
  useEffect(() => {
    // ...
  }, []);
  
  // 3b. Derived state
  const isValid = data && data.length > 0;
  
  // 3c. Event handlers
  const handleClick = () => {
    setIsOpen(true);
  };
  
  // 3d. Early returns
  if (!data) return null;
  
  // 3e. Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Open</button>
    </div>
  );
}
```

### Hooks Rules
- Call hooks at the top level only
- Don't call hooks inside conditions or loops
- Custom hooks must start with `use`

### Conditional Rendering
```typescript
// ❌ Bad - nested ternaries
{isLoading ? <Loader /> : isError ? <Error /> : <Content />}

// ✅ Good - early returns or separate conditions
if (isLoading) return <Loader />;
if (isError) return <Error />;
return <Content />;

// ✅ Good - for simple cases
{isLoading && <Loader />}
{!isLoading && <Content />}
```

### Guard Clauses

Use one-liner returns for simple guard clauses:

```typescript
// ✅ Good - concise guard clause
if (!inputAmount || !exchangeRate) return null;

// ✅ Good - early return with simple condition
if (!data) return null;
if (isLoading) return <Loader />;

// ❌ Avoid - verbose for simple guards
if (!inputAmount || !exchangeRate) {
  return null;
}
```

Use multi-line braces when:
- The body has multiple statements
- The condition is complex and needs visual separation
- You need to add a comment explaining the guard

```typescript
// ✅ Good - multi-line when body has multiple statements
if (!user) {
  console.warn('User not found');
  return null;
}

// ✅ Good - multi-line for complex conditions with explanation
// Check all required fields before proceeding
if (!amount || !address || !isConnected || !isCorrectNetwork) {
  return null;
}
```

### Conditional Variable Assignment

When a variable's value depends on multiple conditions, prefer guard-style `if` statements over nested ternaries. Set a sensible default, then override with guards:

```typescript
// ❌ Bad - nested ternary is hard to scan
const apyDisplay = !isYieldEnabled
  ? "0%"
  : isLoadingApy || isLoadingVaultMetrics
    ? "..."
    : aaveApys[selectedAsset.symbol] || "...";

// ❌ Bad - useMemo for trivial logic (no expensive computation)
const apyDisplay = useMemo(() => {
  if (!isYieldEnabled) return "0%";
  if (isLoadingApy || isLoadingVaultMetrics) return "...";
  return aaveApys[selectedAsset.symbol] || "...";
}, [isYieldEnabled, isLoadingApy, isLoadingVaultMetrics, aaveApys, selectedAsset.symbol]);

// ✅ Good - guard-style, no else, no ternary
let apyDisplay = aaveApys[selectedAsset.symbol] || "...";
if (!isYieldEnabled) apyDisplay = "0%";
if (isYieldEnabled && (isLoadingApy || isLoadingVaultMetrics)) apyDisplay = "...";
```

This also applies to multi-dimension selections (e.g., picking a group then a variant):

```typescript
// ❌ Bad - nested ternaries across multiple dimensions
if (mode === "deposit") {
  return isYield
    ? asset.vaultAddresses.ethereum.yieldBearing
    : asset.vaultAddresses.ethereum.standard;
}
return isYield
  ? asset.vaultAddresses.via.yieldBearing
  : asset.vaultAddresses.via.standard;

// ✅ Good - separate each decision into its own guard
if (mode === "deposit" && isYield) return asset.vaultAddresses.ethereum.yieldBearing;
if (mode === "deposit") return asset.vaultAddresses.ethereum.standard;
if (isYield) return asset.vaultAddresses.via.yieldBearing;
return asset.vaultAddresses.via.standard;
```

**When to use each pattern:**

| Conditions | Pattern |
|------------|---------|
| Single condition, two values | Single ternary is fine: `const x = isReady ? value : fallback` |
| 2+ conditions | Guard-style `if` overrides (no `else`) |
| Multi-dimension selection | Pick group first, then pick variant (no nesting) |
| Expensive computation | `useMemo` with early returns inside |
| Trivial property access / boolean checks | Plain derived variable, no `useMemo` |

**General principle:** Prefer guard-style `if` over ternary when possible. Ternaries add cognitive load because the reader must mentally parse `condition ? A : B` instead of reading top-to-bottom. A single simple ternary (e.g., `const x = isReady ? value : fallback`) is acceptable, but default to guard-style for anything more complex.

### Reducing Cognitive Load

Beyond ternaries, watch for these common patterns that force the reader to hold too much in their head:

**1. Inline expressions in JSX props** - Extract to a named local before the return:

```typescript
// ❌ Bad - reader must parse logic while scanning JSX
<TransactionSummaryCard fee={feeBreakdown.totalGasFeeEth ? `${feeBreakdown.totalGasFeeEth} ETH` : "Estimated in wallet"} />

// ✅ Good - derive before render, JSX stays scannable
let gasFeeDisplay = "Estimated in wallet";
if (feeBreakdown.totalGasFeeEth) gasFeeDisplay = `${feeBreakdown.totalGasFeeEth} ETH`;

<TransactionSummaryCard fee={gasFeeDisplay} />
```

**2. Repeated near-identical object literals** - Extract a shared constant:

```typescript
// ❌ Bad - reader must diff 3 copies to spot differences
setResult({ totalFee: null, approvalFee: null, mainFee: null, bridgeFee: null, isLoading: false, error: null });
// ... later ...
setResult({ totalFee: null, approvalFee: null, mainFee: null, bridgeFee: null, isLoading: false, error: "Failed" });

// ✅ Good - shared shape, override only what changes
const emptyFees = { totalFee: null, approvalFee: null, mainFee: null, bridgeFee: null };
setResult({ ...emptyFees, isLoading: false, error: null });
// ... later ...
setResult({ ...emptyFees, isLoading: false, error: "Failed" });
```

**3. Wall-of-params destructuring in function signatures** - Destructure inside the body:

```typescript
// ❌ Bad - 12+ params in the signature is hard to scan
export function MyComponent({amount, fee, netReceive, unit, netReceiveUnit, showConversion, conversionRate, className, feeLabel, feeDescription, additionalFees, isFeeLoading}: MyComponentProps) {

// ✅ Good - clean signature, destructure inside
export function MyComponent(props: MyComponentProps) {
  const { amount, fee, netReceive, unit, netReceiveUnit, showConversion, conversionRate, className, feeLabel, feeDescription, additionalFees, isFeeLoading } = props;

// ✅ Good - small prop lists can stay inline when readable
export function SmallComponent({ mode, onModeChange, isLoading }: SmallComponentProps) {
```

**Function signature rule of thumb:**
- Keep destructured function signatures on one line when they are still easy to scan.
- Use multiline destructuring or `props` + in-body destructuring when the signature becomes a wall of params.
- Practical threshold: if it is **more than 8 props** or roughly **more than 140 characters**, do not force a one-liner.

### Derived State with useMemo

Prefer deriving display values from raw data instead of storing formatted strings:

```typescript
// ❌ Bad - storing formatted state (causes sync issues)
const [exchangeRateDisplay, setExchangeRateDisplay] = useState<string | null>(null);

useEffect(() => {
  if (exchangeRate) {
    setExchangeRateDisplay(`1 USDC = ${rate.toFixed(4)} vUSDC`);
  }
}, [exchangeRate, activeTab]);

// ✅ Good - derive from raw data
const exchangeRateDisplay = useMemo(() => {
  if (!metrics.exchangeRate) return null;
  return formatVaultRate(metrics.exchangeRate, underlyingSymbol, vaultShareSymbol, activeTab);
}, [metrics.exchangeRate, underlyingSymbol, vaultShareSymbol, activeTab]);
```

Benefits:
- No unnecessary state variables
- No sync issues between raw and formatted values
- Changes to display-only deps (like `activeTab`) don't trigger API refetches

## Form Validation (Zod + React Hook Form)

### Key Principles

1. **Static schemas over factory functions** - Don't recreate schemas on state changes
2. **Use `superRefine` for dynamic values** - Access balance via form context, not closure
3. **Consolidate refines** - One refine per field, not chained refines
4. **Let browser handle input constraints** - Don't validate decimal places in Zod

### Reference Implementation

See `src/components/deposit-form.tsx` for the preferred pattern.

```typescript
// ❌ Bad - schema recreated on balance change (causes re-renders)
const createSchema = (balance: string | null) => z.object({
  amount: z.string().refine((val) => {
    if (!balance) return true;
    return parseFloat(val) <= parseFloat(balance);
  }, "Exceeds balance"),
});
const schema = createSchema(balance); // New schema every render!

// ✅ Good - static schema with superRefine context
const schema = z.object({
  amount: z.string()
    .refine((val) => {
      if (!val?.trim()) return true; // Allow empty, handle at submit
      return parseFloat(val) >= MIN_AMOUNT;
    }, "Minimum is X")
    .superRefine((val, ctx) => {
      const formValues = ctx.path[0] as { _balance?: string };
      const balance = parseFloat(formValues?._balance || "0");
      if (balance > 0 && parseFloat(val) > balance) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exceeds balance" });
      }
    }),
});

// Pass balance via hidden form field
form.setValue("_balance", balance);
```

### Anti-Patterns

| ❌ Avoid | ✅ Prefer |
|----------|-----------|
| `createSchema(balance)` factory | Static schema + `_balance` field |
| Chained `.refine().refine().refine()` | Single refine with all checks |
| Manual decimal validation in Zod | `<Input type="number" step="0.000001" />` |
| Aggressive validation on empty | Allow empty in schema, disable button via derived state |

## Ethers.js Patterns

### Provider/Signer Resolution

When a function accepts `ethers.Provider | ethers.Signer`, resolve to a Provider by checking for a Provider-specific method (like `estimateGas` or `getFeeData`), not by checking for `"provider" in x`:

```typescript
// ❌ Verbose and imprecise - "provider" exists on both sides of the union
const resolvedProvider =
  "provider" in provider && provider.provider
    ? provider.provider
    : (provider as ethers.Provider);

// ❌ Unsafe - falls back to the Signer itself if signer.provider is null
const resolvedProvider = (provider as ethers.Signer).provider ?? provider;

// ✅ Check for the method you actually need, then guard against null
const resolvedProvider = 'estimateGas' in provider ? provider : (provider as ethers.Signer).provider;
if (!resolvedProvider) throw new Error("Signer has no attached provider");
```

**Why check for `estimateGas` instead of `provider`?**
- `estimateGas` only exists on `ethers.Provider`, so it cleanly discriminates the union
- `"provider"` can exist on both Signers and Providers (imprecise)
- The `in` check narrows the type for TS and validates at runtime in one step

## Async/Await

### Error Handling
```typescript
// ❌ Bad - unhandled promise
async function fetchData() {
  const response = await api.get('/data');
  return response.data;
}

// ✅ Good - proper error handling
async function fetchData(): Promise<Data | null> {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return null;
  }
}
```

### Loading States
```typescript
// Always track loading state for async operations
const [isLoading, setIsLoading] = useState(false);

async function handleSubmit() {
  setIsLoading(true);
  try {
    await submitData();
  } finally {
    setIsLoading(false);
  }
}
```

## Comments

### When to Comment
- Complex business logic
- Non-obvious workarounds
- TODO items with context
- Public API documentation

### Component JSDoc and Inline Comment Policy

Use a **light documentation** approach for components and hooks:

- Add **one short JSDoc block** on exported components/hooks/services when their purpose is not obvious at a glance.
- Add **inline comments only for non-obvious implementation details** (workarounds, hidden constraints, cross-file coupling).
- Prefer clear naming over comments when possible.

Avoid over-commenting:

- Do not add comments that only restate the next line.
- Do not add multiple comments for straightforward render code.
- If a comment becomes stale-prone, replace it with better naming or extracted helpers.

Quick rule of thumb:

| Situation | Guidance |
|-----------|----------|
| Exported component with mixed responsibilities | Add 1 short JSDoc summary |
| Simple presentational component | No JSDoc required |
| Non-obvious workaround (e.g., hidden trigger, provider quirk) | Add 1 inline why-comment |
| Obvious code (`setState`, direct `.click()`, trivial mapping) | No comment |

```typescript
// ❌ Bad - obvious comment
// Set the user name
const userName = user.name;

// ✅ Good - explains why
// Xverse may report "Signet" while our config uses "Testnet4"
// Normalize both for comparison
const normalize = (name: string) => name.toLowerCase() === 'signet' ? 'testnet4' : name;

// ✅ Good - TODO with context
// TODO: Replace with API call when backend supports it (ticket #123)
const hardcodedFee = 0.001;
```

### JSDoc for Public APIs
```typescript
/**
 * Switches the wallet to the specified network.
 * @param network - Target network identifier
 * @returns Promise resolving to success status
 * @throws {NetworkError} If network switch fails
 */
async function switchNetwork(network: NetworkType): Promise<boolean> {
  // ...
}
```

### Avoid LLM-isms in Documentation

When writing JSDoc comments and documentation, use plain English instead of Unicode symbols that LLMs tend to overuse:

| ❌ Avoid (LLM-isms) | ✅ Prefer (Plain English) |
|---------------------|---------------------------|
| `→` (arrow) | "to" or "into" |
| `←` (arrow) | "from" |
| `↔` (bidirectional) | "between" |
| `•` (bullet) | `-` (hyphen) |
| `—` (em dash) | `-` (hyphen) or rewrite |
| `"` `"` (smart quotes) | `"` (straight quotes) |

```typescript
// ❌ Bad - Unicode arrows (LLM-ism)
* - Deposit: underlying (USDC) → vault shares (vUSDC)

// ✅ Good - Plain English
* - Deposit: underlying (USDC) to vault shares (vUSDC)
```

**Why this matters:**
- Easier to type for future maintainers
- Consistent with typical JS/TS documentation conventions
- Avoids potential encoding issues in some editors/tools
- More searchable (can search for "to" but not easily for "→")

## Logging Guidelines

### When to Log

| Scenario | Log? | Reason |
|----------|------|--------|
| API/network errors in services | ✅ Yes | Helps debug external failures |
| Unexpected errors in hooks | ✅ Yes | Helps debug state issues |
| Pure utility function failures | ❌ No | Return `null`/`undefined`, let caller decide |
| Expected validation failures | ❌ No | Not an error, just invalid input |
| Temporary debugging | ✅ Yes | Remove before committing |

### Avoid Bracketed Prefixes (LLM-ism)

Don't use `[functionName]` prefixes in log messages - browser DevTools already show file/line info:

```typescript
// ❌ Bad - LLM-style verbose prefix
console.error("[useVaultMetrics] Error fetching vault metrics:", error);

// ✅ Good - simple, readable message
console.error("Failed to fetch vault metrics:", error);
```

## Formatting

### Prettier Config (recommended)
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Line Length
- Prefer 1-liners when possible.
- Use multi-line formatting only when a 1-liner becomes hard to read (many arguments/props, nested calls) or when you need to add comments per argument/prop.
- Avoid extreme line lengths; use judgement.

For **function signatures with destructured props**:
- Prefer a one-liner when readable.
- Switch to multiline or `props` + in-body destructuring when it crosses the readability threshold (more than 8 props or about 140 characters).

```typescript
// ✅ Preferred - readable as a single line
const result = someFunction(veryLongArgumentOne, veryLongArgumentTwo, veryLongArgumentThree, veryLongArgumentFour);
```

```tsx
// ✅ Preferred - JSX one-liner
<AvailableBalanceDisplay balance={balance} unit={unit} isLoading={isLoading} />
```

For **short-to-medium JSX elements**:
- Prefer one-line JSX when the element is still easy to scan.
- Practical threshold: keep it one line up to roughly **8 props** or about **180 characters**.
- Switch to multiline when readability drops (very long prop values, nested expressions, comments per prop, or repeated deep property chains).

### JSX one-liners and className composition

When a JSX element only has a few short props, prefer a one-liner:

```tsx
// ✅ Preferred
<button type='button' onClick={handleClick} className={buttonClass}>Deposit</button>
```

For long `className` values, avoid keeping massive Tailwind strings inline in JSX.
Extract class tokens above the return, then compose with `cn(...)`:

```tsx
// ❌ Hard to scan in JSX
<button className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1' />

// ✅ Preferred - class tokens + composition
const badgeBaseClass = 'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white transition-colors';
const badgeToneClass = 'bg-red-500 hover:bg-red-600';
const badgeFocusClass = 'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1';

<button className={cn(badgeBaseClass, badgeToneClass, badgeFocusClass)} />
```

Rule of thumb:
- Keep **simple markup** as one-liners.
- Extract **verbose/repeated className segments** into named locals.
- If extracting class tokens makes JSX shorter and clearer, do it.

This also applies to constructor calls, chained method calls, `await` expressions, function signatures, and `Promise.all`:

```typescript
// ❌ Unnecessarily verbose - each argument on its own line
const contract = new ethers.Contract(
  tokenAddress,
  ERC20_ABI,
  signer
);
const allowance: bigint = await contract.allowance(
  userAddress,
  vaultAddress
);
const tx = await contract.approve.populateTransaction(
  vaultAddress,
  amountBN
);
export async function estimateGas(
  provider: ethers.Provider,
  tx: ethers.TransactionRequest
): Promise<GasResult | null> {
const [gasLimit, feeData] = await Promise.all([
  provider.estimateGas(tx),
  provider.getFeeData(),
]);

// ✅ Preferred - clean 1-liners
const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
const allowance: bigint = await contract.allowance(userAddress, vaultAddress);
const tx = await contract.approve.populateTransaction(vaultAddress, amountBN);
export async function estimateGas(provider: ethers.Provider, tx: ethers.TransactionRequest): Promise<GasResult | null> {
const [gasLimit, feeData] = await Promise.all([provider.estimateGas(tx), provider.getFeeData()]);
```

This also applies to `.reduce()` callbacks and React hook dependency arrays:

```typescript
// ❌ Unnecessarily verbose
const maxPrice = valid.reduce(
  (max, e) => (e.gasPriceWei > max ? e.gasPriceWei : max),
  0n
);

useEffect(() => {
  // ...
}, [
  debouncedAmount,
  recipientAddress,
  mode,
  asset,
  chainId,
  enabled,
]);

// ✅ Preferred - 1-liners
const maxPrice = valid.reduce((max, e) => (e.gasPriceWei > max ? e.gasPriceWei : max), 0n);

useEffect(() => {
  // ...
}, [debouncedAmount, recipientAddress, mode, asset, chainId, enabled]);
```

### When 1-liners get too long: extract locals

When a single-line function call or guard clause becomes hard to scan because of deeply nested property access (e.g. `form.vaultMetrics.exchangeRate`), extract short locals first. This keeps each statement as a 1-liner while staying readable:

```typescript
// ❌ Hard to scan - too many deep accesses on one line
if (form.mode !== "withdraw" || !form.isYieldEnabled || !form.inputAmount || !form.vaultMetrics.exchangeRate) return null;
const expected = calculateVaultConversion(form.inputAmount, form.vaultMetrics.exchangeRate, "withdraw", form.selectedAsset.decimals);

// ✅ Extract locals, then use short names in the 1-liner
const isWithdraw = form.mode === "withdraw";
const exchangeRate = form.vaultMetrics.exchangeRate;
const inputAmount = form.inputAmount;
if (!isWithdraw || !form.isYieldEnabled || !inputAmount || !exchangeRate) return null;

const expected = calculateVaultConversion(inputAmount, exchangeRate, "withdraw", form.selectedAsset.decimals);
```

**When to extract locals:**
- Deep property chains repeated multiple times (e.g. `form.vaultMetrics.exchangeRate`)
- Guard clauses with 4+ conditions that each access nested properties
- Function calls where the same long expression appears as multiple arguments
