# State Management Boundaries

## Goal

Keep state ownership obvious so changes do not leak connector behavior into UI
or duplicate the same source of truth across multiple layers.

## Ownership rules

### Components

Components should:

- render derived state
- invoke actions and callbacks
- keep only local UI state that is truly presentational

Components should not:

- own wallet teardown behavior
- mutate persisted wallet/session storage directly unless they are the clear
  owner
- duplicate Redux state with ad hoc local caches

### Hooks

Hooks should own:

- orchestration across provider state, Redux state, and local side effects
- reusable transaction flows such as swap, approve, and wrap
- wallet/session reconciliation logic

### Redux

Redux should own:

- shared application state
- transaction tracking
- user preferences
- form state that affects multiple surfaces or routes

Redux should not own:

- provider objects
- connector internals that belong to the wallet library

### Storage helpers

Storage helpers should own:

- minimal persisted intent
- versioned local storage schemas

Storage helpers should not become shadow state stores for provider truth.

## Relevant directories

- `src/state/`
- `src/hooks/`
- `src/pages/App.tsx`
- `src/pages/AppBody.tsx`
- `src/components/Header/`
- `src/state/wallet/sessionStorage.ts`