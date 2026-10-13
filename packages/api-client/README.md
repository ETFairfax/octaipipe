# @workspace/api-client

Transport and query-client infrastructure, shared by every app and every domain data package. It
knows nothing about any domain.

## Usage

```tsx
import { useApiClient } from '@workspace/api-client';

// Inside a domain data package (e.g. @workspace/organization-data):
const apiClient = useApiClient();
apiClient.get('organization/123').json();
```

## Query client setup

`successMessage`/`errorMessage` are delivered through a `Notifier` passed as `createQueryClient`'s second
argument (`api-client` has no toast dependency); without one they are ignored. In the platform app the
notifier raises a `@workspace/ui` toast, so **`<Toaster />` must be rendered** — `QueryProvider` does not
mount it, but every app already gets one from `createApp`.

An app can extend the mutation defaults without replacing them — `createQueryClient` composes an
app-supplied `onSettled`/`onSuccess`/`onError` *after* the base toast/invalidation logic runs:

```ts
const queryClient = createQueryClient({
  mutations: {
    onError: (error, variables, onMutateResult, context) => {
      // runs after the base handler's error toast
      reportToErrorTracker(error);
    }
  }
});
```

## Tests

```sh
pnpm --filter @workspace/api-client test
```
