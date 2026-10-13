# API Client

Horizontal transport package: the shared `ky` instance (`ApiClientProvider`/`useApiClient`), the
global `QueryClient`/mutation-meta setup, the mutation helpers, and the runtime config document
every app fetches at startup. Knows nothing about any domain -- query keys, `queryOptions` and
mutations live in each domain's `*-data` package (e.g. `@workspace/organization-data`).

## Language

**mutationMeta**:
The `Register.mutationMeta` module augmentation declaring what a
`useMutation` call's `meta` object may contain: `invalidatesQuery`, `successMessage`,
`errorMessage`, and `snapshot`. This is the vocabulary the global `QueryClient` mutation defaults
read.
_Avoid_: Adding invalidation or toast logic to an individual hook instead of setting `meta` and
letting the global handlers do it — see "compose override" below for the one exception (app-level
extension).

**invalidatesQuery**:
A `mutationMeta` field: the `QueryKey` (or `QueryKey[]`) the global `onSettled` handler
invalidates once a mutation settles. Disambiguating a single key from a list of keys relies on
TanStack's own convention that a `QueryKey`'s first element is a string tag — so a `QueryKey[]`'s
first element, itself being an array, is the discriminator. This is not a strict
guarantee: a single `QueryKey` whose first element is itself an array would be misread.
_Avoid_: Assuming `Array.isArray(value)` alone can tell a `QueryKey` from a `QueryKey[]` — a
`QueryKey` is itself an array.

**successMessage / errorMessage**:
`mutationMeta` fields: when set, the global `onSuccess`/`onError` handlers call the app-supplied
`Notifier` (`createQueryClient(overrides, notify)`'s second argument) with the given string. No-ops
if no notifier was supplied. The platform app's notifier raises a `@workspace/ui` toast, which
needs `<Toaster />` mounted (every app gets one from `createApp`).
_Avoid_: Expecting a toast without confirming the app passes a notifier and renders `<Toaster />`; importing a toast library into `api-client`.

**compose override**:
`createQueryClient(overrides?)`'s rule for app-supplied `defaultOptions.mutations` handlers: an
app's `onSettled`/`onSuccess`/`onError` runs *after* the base toast/invalidation logic, not instead
of it. This is deliberate, so an app extending the defaults can never silently
break invalidation or toasts for every other mutation in that app.
_Avoid_: Assuming an app-supplied handler replaces the base one; it composes.

**useAppMutation**:
A pure `useMutation` pass-through, kept only as the
naming-symmetry counterpart to `useOptimisticMutation` for mutations that don't need an optimistic
update. Does no meta handling of its own — the global `QueryClient`
handlers own that.
_Avoid_: Re-adding per-hook invalidation logic here; that was the earlier behavior this hook
was simplified away from.
