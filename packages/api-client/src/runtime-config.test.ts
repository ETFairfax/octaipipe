import { describe, expect, it } from 'vitest';
import { loadRuntimeConfig } from './runtime-config.js';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body
  } as Response;
}

const validBody = {
  clientId: 'client_test',
  redirectUri: 'https://app.example.com/callback',
  apiUrl: 'https://api.example.com'
};

describe('loadRuntimeConfig', () => {
  it('fetches the default config URL and returns the parsed document', async () => {
    let requestedUrl: RequestInfo | URL | undefined;
    const fetchImpl: typeof fetch = async url => {
      requestedUrl = url;
      return jsonResponse(validBody);
    };

    const config = await loadRuntimeConfig(undefined, fetchImpl);

    expect(requestedUrl).toBe('/config.json');
    expect(config).toEqual(validBody);
  });
});
