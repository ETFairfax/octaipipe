# Octaipipe Take Home Assessment

Installation instructions for running the application are below.

The project started from my personal boilerplate, which I use to experiment with new tools and frameworks. It includes [`docs/frontend-architecture.md`](./docs/frontend-architecture.md), which sets out the high-level structure I aim for.

I've used Claude Code throughout, guided by [matt-pocock-skills](https://github.com/mattpocock/skills) (mainly the grilling skills) to keep us aligned on decisions. There are parts I'd do differently with more time, and I'd welcome the chance to talk them through.

## Getting started

```bash
pnpm install
pnpm dev:mock   # start app in dev mode
```

Open browser at [http://localhost:4000/](http://localhost:4000/)

All scripts (build, typecheck, check, boundaries, lint:imports, test, deps:*) are in the root
`package.json`; CI runs the same checks.

## What's inside

### Apps

| App | Description |
|---|---|
| `apps/platform` | The deployable React frontend, served at the primary domain root. 

### Packages

| Package | Description |
|---|---|
| `packages/utils` | Horizontal framework-agnostic helpers |
| `packages/ui` | Shared shadcn primitive components (`Button`, etc.) consumed by apps |
| `packages/api-client` | Horizontal API transport, `QueryClient` setup and runtime config — see [`packages/api-client/README.md`](./packages/api-client/README.md) |
| `packages/psychrometrics-data` | Psychrometrics domain data: site feed, humid-air physics, compliance rules — see [`packages/psychrometrics-data/README.md`](./packages/psychrometrics-data/README.md) |
| `packages/psychrometrics-ui` | Psychrometrics domain UI: the psychrometric chart and live site page |

## Architecture decisions

How the frontend is structured (layers, boundaries, routing) is in
[`docs/frontend-architecture.md`](./docs/frontend-architecture.md). Domain vocabulary lives in per-package
`CONTEXT.md` files, indexed by [`CONTEXT-MAP.md`](./CONTEXT-MAP.md).

## Tech stack

| Tool | Role |
|---|---|
| [React 19](https://react.dev) + [Vite](https://vite.dev) | Frontend framework and build tool |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [shadcn](https://ui.shadcn.com) | Primitive component source |
| [Base UI](https://base-ui.com) | Headless UI primitives |
| [TypeScript 7](https://www.typescriptlang.org) | Type safety |
| [MSW](https://mswjs.io) | API mocking for local dev (`pnpm dev:mock`) and tests |
| [Turborepo](https://turbo.build) | Monorepo task orchestration |
| [pnpm](https://pnpm.io) | Package management and workspaces |
| [Biome](https://biomejs.dev) | Linting and formatting |
| [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) | Import cycle and package-internals checks |

## Dependency management

`pnpm deps:*` scripts (lint, fix, format, list, outdated, update) keep versions consistent across
the workspace; see the root `package.json`.

## Skills

This repo has [matt-pocock-skills](https://github.com/mattpocock/skills) installed — a set of Claude Code slash commands for engineering workflows (grilling, domain modeling, TDD, refactoring, etc.).
