# Code Conventions

Repo-wide code-structure conventions that aren't obvious from reading any single package in isolation.

## Test file placement

Test files live colocated with the source they test (`src/foo.ts` → `src/foo.test.ts`), not under a separate `test/` directory — including fixture-heavy and integration tests.

A `test/` directory, if a package has one, holds only static fixture data — never `*.test.ts` files themselves.

## One function per file

Where practical, each function gets its own file, named after the function in kebab-case (`evaluateReading` → `evaluate-reading.ts`), with its tests colocated in a matching `evaluate-reading.test.ts`. This includes private helpers: export them from their own file so they can be tested directly, and keep them out of the package's `src/index.ts`.

Keep related types and constants that aren't functions together in a `types.ts` (or similarly named) file in the same folder. Group a closely coupled pair in one file only when neither makes sense or can be tested alone.

Each function carries a short header comment saying what that function does: its behaviour and any non-obvious edge (e.g. whether a limit is inclusive). Don't describe who calls it or why.

## Type casting

`as` and `unknown` are only for when TypeScript truly cannot infer or check something — never as a shortcut past a type error. Before reaching for one, fix the actual mismatch: widen/narrow a declared type, add a proper type guard, or type a test double against the real signature (e.g. `const fetchImpl: typeof fetch = async url => {...}` instead of declaring a narrower parameter type and then casting the whole function with `as unknown as typeof fetch`).

A double cast (`as unknown as X`) is the strongest signal something is wrong — it exists specifically to bypass TypeScript's "these types don't overlap" check, so it should be rare and each occurrence should carry a comment explaining why no narrower fix is possible (e.g. reading a field the library deliberately keeps off its public type).

## `@workspace/ui` imports

Prefer importing from the barrel, `@workspace/ui/components`, over a deep `@workspace/ui/components/*` path when writing or touching a consumer file:

```ts
// Prefer
import { Button, Card, CardContent } from '@workspace/ui/components';

// Over
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
```

The barrel (`packages/ui/src/components/index.ts`) is hand-maintained, not generated. If a component you need isn't re-exported yet, add its `export * from './path'` line before migrating the consumer file. The deep `@workspace/ui/components/*` wildcard path still works and doesn't need this — it's the only path that's wired up automatically when a component is installed via the shadcn MCP server, so leaving files on it is fine and not a violation of this convention.

Hooks follow the same rule with their own hand-maintained barrel, `@workspace/ui/hooks` (`packages/ui/src/hooks/index.ts`). Prefer it over `@workspace/ui/hooks/<name>` in files you touch; the deep path still works.

## Plans are short-lived

Files under `docs/plans/` are working plans that get deleted once implemented or dropped. Never link to or mention them from any other document (`.md`, code comments, ADRs, `CONTEXT.md`, READMEs, `CLAUDE.md`), and never cite a plan number or filename as the reason for a decision. Put anything that must outlive a plan in a durable place instead: `docs/frontend-architecture.md`, an ADR in `docs/adr/`, a `CONTEXT.md`, or a GitHub issue. When deleting a plan, grep the repo for references to it first. Plans may reference each other and the durable docs.

## Writing documentation

Docs (`README.md`, `CONTEXT.md`, `docs/`) carry what the code can't say; the code is always the source of truth for what it does. A doc that restates code is right only until the next change, and an agent will trust it over the code.

Write down:

- Purpose and boundaries: what a module is for and what doesn't belong in it.
- Vocabulary: the terms to use and the synonyms to avoid.
- Rationale and non-obvious constraints: why it is built this way, and what looks wrong but is deliberate.
- Invariants that hold across files and can't be seen from any one of them.
- Pointers to the source, as a file path or symbol name.

Don't write down:

- Signatures, provider or call order, config keys, export lists, script lists or file inventories. Point to the file instead (`runtimeConfigSchema`, a package's `src/index.ts`, the root `package.json`).
- Code that copies real code. A short snippet is fine only when it shows a pattern to follow, not what a function currently does.
- Status or progress ("currently a stub", "not yet implemented"). Use a GitHub issue.
- Section or rule numbers of other docs. Cite the heading, so renumbering doesn't break the reference.

Before finishing a code change, check whether the README or CONTEXT.md of each package you touched still holds. If a doc paragraph would need editing every time the code changes, delete it or replace it with a pointer.

Ensure documentation is consice. 