import { QueryClient, type QueryClientConfig, type QueryKey } from '@tanstack/react-query';
import '../mutation/mutation-meta.js';

export type QueryClientOverrides = QueryClientConfig['defaultOptions'];

/** How `meta.successMessage`/`meta.errorMessage` reach the user; supplied by the app. */
export type Notifier = {
  success: (message: string) => void;
  error: (message: string) => void;
};

// QueryKey is itself an array, so `QueryKey | QueryKey[]` can't be disambiguated by
// Array.isArray alone -- a plain `Array.isArray(value)` would treat a single key like
// ['organization', id] as an array of keys and invalidate 'organization' and id separately.
// Discriminated instead by whether the first element is itself an array, which holds as long as
// query keys in this repo follow TanStack's widely-recommended convention of leading with a
// string tag -- not a strict guarantee.
const isQueryKeyArray = (value: QueryKey | QueryKey[]): value is QueryKey[] =>
  Array.isArray(value[0]);

const asQueryKeys = (value: QueryKey | QueryKey[] | undefined): QueryKey[] => {
  if (value === undefined) return [];
  return isQueryKeyArray(value) ? value : [value];
};

/**
 * Composes global notification/invalidation defaults with app-supplied mutation handlers, base-then-app
 * order, rather than letting an app override silently replace them.
 */
export function createQueryClient(
  overrides?: QueryClientOverrides,
  notify?: Notifier
): QueryClient {
  const appMutations = overrides?.mutations;

  return new QueryClient({
    defaultOptions: {
      // One retry, not TanStack's default of three with backoff: a failing route loader should
      // reach the route errorComponent in seconds, not after several silent retries.
      queries: { refetchOnWindowFocus: false, retry: 1, ...overrides?.queries },
      mutations: {
        onSettled(data, error, variables, onMutateResult, context) {
          for (const queryKey of asQueryKeys(context.meta?.invalidatesQuery)) {
            context.client.invalidateQueries({ queryKey });
          }
          return appMutations?.onSettled?.(data, error, variables, onMutateResult, context);
        },
        onSuccess(data, variables, onMutateResult, context) {
          if (context.meta?.successMessage) notify?.success(context.meta.successMessage);
          return appMutations?.onSuccess?.(data, variables, onMutateResult, context);
        },
        onError(error, variables, onMutateResult, context) {
          if (context.meta?.errorMessage) notify?.error(context.meta.errorMessage);
          return appMutations?.onError?.(error, variables, onMutateResult, context);
        }
      }
    }
  });
}
