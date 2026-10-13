import {
  type MutationFunction,
  type QueryKey,
  useMutation as useTanstackMutation
} from '@tanstack/react-query';
import type { OptimisticMutationOptions } from './types.js';

/**
 * A custom hook that provides optimistic deletion for a resource identified by an ID.
 * It accepts a mutation function, the query key to invalidate, and optional mutation options.
 * The onMutate callback optimistically removes the item from the cache and returns a snapshot for rollback.
 * The onError callback rolls back to the snapshot if the mutation fails.
 * The onSettled callback invalidates the queries to ensure data consistency.
 */

type IdResource = { id: number | string };
export const useOptimisticDelete = <
  TData extends IdResource,
  TError = Error,
  TVariables extends IdResource = TData
>(
  mutationFn: MutationFunction<TData, TVariables>,
  queryKey: QueryKey,
  options?: OptimisticMutationOptions<TData, TError, TVariables>
) =>
  useTanstackMutation<TData, TError, TVariables, { snapshot: TData[] | undefined }>({
    mutationFn,
    onMutate: async (variables, context) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await context.client.cancelQueries({ queryKey });

      // Snapshot the previous value
      const snapshot = context.client.getQueryData<TData[]>(queryKey);

      // Optimistically delete the item from the cache
      context.client.setQueryData(
        queryKey,
        (old: TData[] | undefined) => old?.filter(item => item.id !== variables.id) ?? old
      );

      // Note: Calling custom onMutate after having written the optimistic data to the cache
      const additionalOnMutateResult = await options?.onMutate?.(variables, context);

      // Return the snapshot value so it can be passed to onError and onSettled
      return { snapshot, ...additionalOnMutateResult };
    },
    onError: (error, variables, onMutateResult, context) => {
      // Roll back to the snapshot value
      if (onMutateResult?.snapshot !== undefined) {
        context.client.setQueryData(queryKey, onMutateResult.snapshot);
      }

      // Note: Calling custom onError after having rolled back the optimistic update
      options?.onError?.(error, variables, onMutateResult, context);
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      // The cache is already updated optimistically and will be rolled back on error.
      // However, we still want to invalidate the queries to ensure data consistency in case the server response differs from our optimistic update.
      context.client.invalidateQueries({ queryKey });

      // Note: Calling custom onSettled after having invalidated the queries
      options?.onSettled?.(data, error, variables, onMutateResult, context);
    }
  });
