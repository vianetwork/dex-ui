# Code-Change Guardrails

## Keep fixes small and reviewable

- prefer focused patches over broad rewrites
- search and read relevant code before editing
- update one file completely before moving to the next when possible

## Respect existing boundaries

- keep presentational UI thin
- centralize wallet and session logic instead of patching several components
- prefer shared helpers over duplicated inline logic

## Prefer existing patterns over new abstractions

- if artifact-driven config exists, use it
- if a hook already owns a lifecycle concern, extend that hook first
- if Redux already owns shared state, do not mirror it elsewhere without a clear
  reason

## Avoid ambiguous product behavior

- disconnect should not secretly behave like switch account
- change wallet should not be the only place injected account reconciliation
  happens
- do not hide important UX semantics behind implementation shortcuts

## Keep docs aligned with changes

After significant repo-guidance, workflow, or architectural changes, update the
relevant docs:

- `AGENTS.md`
- `.clinerules/CLINE-WORKFLOW.md`
- `memory-bank/activeContext.md`
- `memory-bank/progress.md`
- `memory-bank/techContext.md`