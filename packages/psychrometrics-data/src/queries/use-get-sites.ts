import { queryOptions, useQuery } from '@tanstack/react-query';
import { useApiClient } from '@workspace/api-client';
import type { KyInstance } from 'ky';
import { z } from 'zod';
import { psychrometricsKeys } from '../keys.js';
import { SiteSchema } from '../types/index.js';

const staleTime = 5 * 60 * 1000;

const SitesSchema = z.array(SiteSchema);

export const fetchSites = async (apiClient: KyInstance) =>
  SitesSchema.parse(await apiClient.get('psychrometrics/sites').json());

export const getSitesOptions = (apiClient: KyInstance) =>
  queryOptions({
    queryKey: psychrometricsKeys.sites(),
    queryFn: () => fetchSites(apiClient),
    staleTime
  });

export const useGetSites = () => useQuery(getSitesOptions(useApiClient()));
