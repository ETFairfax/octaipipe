import { z } from 'zod';

const runtimeConfigSchema = z.object({
  clientId: z.string(),
  redirectUri: z.string(),
  apiUrl: z.string(),
  appLinks: z.record(z.string(), z.string()).optional(),
  signInUrl: z.string().optional(),
  supportEmail: z.string().optional()
});

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;

const DEFAULT_CONFIG_URL = `${import.meta.env.BASE_URL}config.json`;

export class InvalidRuntimeConfigError extends Error {
  constructor(error: unknown) {
    super(`Runtime config document is invalid: ${error}`);
    this.name = 'InvalidRuntimeConfigError';
  }
}

export class RuntimeConfigFetchError extends Error {
  constructor(configUrl: string, cause: unknown) {
    super(`Failed to fetch runtime config from ${configUrl}: ${(cause as Error).message}`);
    this.name = 'RuntimeConfigFetchError';
  }
}

export async function loadRuntimeConfig(
  configUrl: string = DEFAULT_CONFIG_URL,
  fetchImpl: typeof fetch = fetch
): Promise<RuntimeConfig> {
  let response: Response;
  try {
    response = await fetchImpl(configUrl);
  } catch (err) {
    throw new RuntimeConfigFetchError(configUrl, err);
  }
  if (!response.ok) {
    throw new RuntimeConfigFetchError(configUrl, new Error(`HTTP ${response.status}`));
  }

  const body: unknown = await response.json();

  const result = runtimeConfigSchema.safeParse(body);

  if (!result.success) {
    throw new InvalidRuntimeConfigError(result.error);
  }

  return result.data;
}
