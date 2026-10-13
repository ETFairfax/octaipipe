import type { MutationOptions } from '@tanstack/react-query';

export type OptimisticMutationOptions<TData, TError = Error, TVariables = TData> = MutationOptions<
  TData,
  TError,
  TVariables,
  {
    snapshot?: TData[];
  }
>;

/****
 * Example usage
 *
 * const getOrganizationOptions = (params: Params) =>
 *   queryOptions<Organization, ErrorResponse>({
 *     queryKey: organizationCacheKeys.detail(params.id),
 *     queryFn: () => request(`/organization/${params.id}`)
 *   });
 *
 * export const useGetOrganization = (
 *   params: Params,
 *   options?: QueryOptions<ReturnType<typeof getOrganizationOptions>>
 * ) => useQuery({ ...getOrganizationOptions(params), ...options });
 *
 * ****/

export type QueryOptions<T> = Omit<T, 'queryKey' | 'queryFn'>;
