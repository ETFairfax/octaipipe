import {
  type MutationFunction,
  type QueryKey,
  useMutation as useTanstackMutation
} from '@tanstack/react-query';
import type { OptimisticMutationOptions } from './types.js';

/*
 * A custom hook that wraps useMutation to provide optimistic updates for a given query key.
 * It accepts a mutation function, the query key to invalidate, and optional mutation options.
 * The onMutate callback optimistically updates the cache and returns a snapshot for rollback.
 * The onError callback rolls back to the snapshot if the mutation fails.
 * The onSettled callback invalidates the queries to ensure data consistency.
 */

export const useOptimisticMutation = <TData, TError = Error, TVariables = TData>(
  mutationFn: MutationFunction<TData, TVariables>,
  queryKey: QueryKey,
  options?: OptimisticMutationOptions<TData, TError, TVariables>
) => {
  return useTanstackMutation<TData, TError, TVariables, { snapshot: TData[] | undefined }>({
    ...options,
    mutationFn,
    onMutate: async (variables, context) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await context.client.cancelQueries({ queryKey });

      // Snapshot the previous value
      const snapshot = context.client.getQueryData<TData[]>(queryKey);

      // Optimistically update to the new value unless the user has provided their own onMutate, in which case we assume they will handle the optimistic update themselves
      if (!options?.onMutate) {
        context.client.setQueryData(queryKey, (old: TData[] | undefined) =>
          old ? [...old, variables] : [variables]
        );
      }

      // Calling custom onMutate (if there is no custom onMutate, this will simply do nothing)
      await options?.onMutate?.(variables, context);

      // Return the snapshot value so it can be passed to onError and onSettled
      return { snapshot };
    },
    onError: (error, variables, onMutateResult, context) => {
      // Roll back to the snapshot value
      context.client.setQueryData(queryKey, onMutateResult?.snapshot);

      // Note: Calling custom onError after having rolled back the optimistic update
      options?.onError?.(error, variables, onMutateResult, context);
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      // Always refetch after error or success to ensure the data is up-to-date
      context.client.invalidateQueries({ queryKey });

      // Note: Calling custom onSettled after having invalidated the queries
      options?.onSettled?.(data, error, variables, onMutateResult, context);
    }
  });
};
