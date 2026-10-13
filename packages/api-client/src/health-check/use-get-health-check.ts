import { queryOptions, useQuery } from '@tanstack/react-query';
import type { KyInstance } from 'ky';
import { useApiClient } from '../api-client-provider.js';
import type { QueryOptions } from '../common/mutation/types.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export type HealthStatus = 'ok' | 'error' | 'shutting_down';

export type HealthIndicatorResult = {
  status: 'up' | 'down';
  [key: string]: unknown;
};

export type HealthCheckResult = {
  status: HealthStatus;
  info: Record<string, HealthIndicatorResult>;
  error: Record<string, HealthIndicatorResult>;
  details: Record<string, HealthIndicatorResult>;
};

const healthKeys = {
  all: ['health'] as const
};

const getHealthCheckOptions = (apiClient: KyInstance) =>
  queryOptions<HealthCheckResult, Error>({
    queryKey: healthKeys.all,
    queryFn: () => apiClient.get('health').json<HealthCheckResult>(),
    refetchInterval: 5000 // Refetch every 5 seconds to keep the status updated
  });

export const useGetHealthCheck = (
  options?: QueryOptions<ReturnType<typeof getHealthCheckOptions>>
) => {
  const apiClient = useApiClient();
  return useQuery({ ...getHealthCheckOptions(apiClient), ...options });
};
