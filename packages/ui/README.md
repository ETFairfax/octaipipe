# @workspace/ui

Shared design system: shadcn components (Base UI primitives, Tailwind v4), hooks, and the global
stylesheet. A horizontal package that knows nothing about any domain. Terms (Cookie Banner, Field
vs Form Field, ...) are defined in [`CONTEXT.md`](./CONTEXT.md).

Import paths are defined by `exports` in `package.json`. Prefer the `@workspace/ui/components`
barrel over deep paths (see the code conventions below).

Hooks have their own barrel, `@workspace/ui/hooks` (`src/hooks/index.ts`), separate from the components one. Add an `export *` line there when you add a hook.

## Adding a shadcn component

`components.json` lives in this package, and `.mcp.json` at the repo root scopes the shadcn MCP
server to it (`--cwd packages/ui`). Install new components from here, then add an
`export * from './<name>'` line to `src/components/index.ts`. See
[`docs/agents/code-conventions.md`](../../docs/agents/code-conventions.md) for the barrel rule.

## Tests

```sh
pnpm --filter @workspace/ui test
```
