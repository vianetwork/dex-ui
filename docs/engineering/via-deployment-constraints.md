# Via Network and Deployment Constraints

## Treat Via configuration as repo-specific

Do not assume Ethereum-mainnet defaults. Via-specific chain IDs, wrapped native
token behavior, explorer URLs, and deployment metadata all matter.

## Deployment artifacts first

When an address or explorer value already exists in the deployment artifact
path, prefer reading it from artifacts instead of hardcoding values in feature
code.

Primary files:

- `src/via/deployments/`
- `src/constants/index.ts`
- `src/constants/multicall/`
- `src/constants/v1/`

## ZK Stack compatibility

Via uses ZK Stack behavior that differs from standard EVM assumptions.

- pair address calculation uses `zksync-ethers`
- pair bytecode hash matters for deterministic pair lookup
- address derivation logic belongs in `src/utils/zksync.ts`

## BTC branding consistency

The UI should preserve Via's Bitcoin L2 identity.

- display BTC instead of ETH where the app intentionally casts native token
  branding
- keep naming and visuals consistent with existing Via branding decisions
- do not reintroduce Ethereum-first wording in new UI copy without a product
  reason

## Files to inspect for Via-sensitive work

- `src/via/deployments/`
- `src/constants/index.ts`
- `src/constants/lists.ts`
- `src/state/lists/hooks.ts`
- `src/utils/zksync.ts`