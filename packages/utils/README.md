# @workspace/utils

Framework-agnostic helpers. A horizontal package: no React, no router, and no knowledge of any
domain. Only `src/index.ts` is importable.

```ts
import { formatDate } from '@workspace/utils';

formatDate('2026-03-01'); // "Mar 1, 2026"
```

## Tests

```sh
pnpm --filter @workspace/utils test
```
