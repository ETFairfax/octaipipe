# Utils

Horizontal, framework-agnostic helpers: no React, no router, no domain knowledge. Usage is in
[`README.md`](./README.md).

## Language

**Helper**:
A small pure function exported from `src/index.ts` (e.g. `formatDate`). Anything that needs React,
the router or a domain type belongs in another package.
_Avoid_: Adding domain-specific logic here.
