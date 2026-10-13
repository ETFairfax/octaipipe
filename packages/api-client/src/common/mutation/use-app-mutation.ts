import {
  type DefaultError,
  type MutationFunction,
  type MutationOptions as TanstackMutationOptions,
  useMutation as useTanstackMutation
} from '@tanstack/react-query';

/**
 * A pure `useMutation` pass-through, kept only as the naming-symmetry counterpart to
 * `useOptimisticMutation` for non-optimistic mutations. Invalidation and toasts are handled
 * globally by `createQueryClient`'s `defaultOptions.mutations` reading `meta`, so this hook does no meta handling of its own.
 */

export type MutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown
> = Omit<TanstackMutationOptions<TData, TError, TVariables, TOnMutateResult>, 'mutationFn'>;

export const useAppMutation = <TData, TError = Error, TVariables = void>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: MutationOptions<TData, TError, TVariables>
) => useTanstackMutation({ ...options, mutationFn });
