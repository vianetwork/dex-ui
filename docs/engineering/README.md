# Engineering Docs

This directory contains the repo-specific engineering playbook for `dex-ui`.

Use these docs for deeper subsystem context and onboarding. They are meant to
complement, not replace:

- `.clinerules/*` for Cline workflow and authoring rules
- `AGENTS.md` for the high-signal routing layer
- `memory-bank/*` for current project state

## Reading map

- `architecture-overview.md` - app structure, major boundaries, and file ownership
- `wallet-session-rules.md` - wallet lifecycle semantics and injected-provider syncing
- `state-management-boundaries.md` - what belongs in components, hooks, Redux, and storage helpers
- `via-deployment-constraints.md` - Via chain configuration, deployment artifacts, and BTC branding rules
- `code-change-guardrails.md` - safe change patterns for this repo
- `verification-checklist.md` - commands and manual checks before finishing work

Read only the docs that match the area you are changing instead of reading this
entire directory by default.