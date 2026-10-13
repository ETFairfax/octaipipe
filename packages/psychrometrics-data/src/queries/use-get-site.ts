import { queryOptions, useQuery } from '@tanstack/react-query';
import { useApiClient } from '@workspace/api-client';
import type { KyInstance } from 'ky';
import { psychrometricsKeys } from '../keys.js';
import { SiteSchema } from '../types/index.js';

const staleTime = 5 * 60 * 1000;

export const fetchSite = async (apiClient: KyInstance, siteId: string) =>
  SiteSchema.parse(await apiClient.get(`psychrometrics/sites/${siteId}`).json());

export const getSiteOptions = (apiClient: KyInstance, siteId: string) =>
  queryOptions({
    queryKey: psychrometricsKeys.site(siteId),
    queryFn: () => fetchSite(apiClient, siteId),
    staleTime
  });

export const useGetSite = (siteId: string) => useQuery(getSiteOptions(useApiClient(), siteId));
