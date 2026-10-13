## Read first

- `docs/frontend-architecture.md` — package layers, dependency rules, routing, data fetching, how to add a domain. Read before adding or moving code across packages.
- `docs/agents/code-conventions.md` — test placement, type casting, `@workspace/ui` imports, boundaries.
- `docs/git-workflow.md` — branch naming and the commit format commitlint enforces: `<gitmoji> <type>(#<issue>): <description>`; the scope is a GitHub issue number.
- `apps/platform/README.md` — runtime config and where the app's startup/chrome live.

Scripts are in the root `package.json`; CI (`.github/workflows/ci.yml`) runs check, boundaries, lint:imports, typecheck and test.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for the octaipipe repo; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context repo: `CONTEXT-MAP.md` at root points to per-context `CONTEXT.md` files; ADRs go in `docs/adr/` once any are recorded (none yet). See `docs/agents/domain.md`.

### Code conventions

Repo-wide code-structure conventions (e.g. test file placement, and that `docs/plans/` files are short-lived and must never be referenced from other docs) live in `docs/agents/code-conventions.md`. That file also says how to write docs: record purpose, vocabulary, rationale and invariants, and point to code instead of restating it, so docs don't drift.

## Environment
- Windows machine, but all terminal commands run in Git Bash.
- Use bash/Unix syntax (ls, cat, rm, forward-slash paths like /c/Users/...), not PowerShell or cmd.