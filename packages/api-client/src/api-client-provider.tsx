import ky, { type KyInstance } from 'ky';
import * as React from 'react';

const ApiClientContext = React.createContext<KyInstance | null>(null);

interface ApiClientProviderProps {
  apiUrl: string;
  // Resolves a bearer token for the Authorization header. Supplied by the app (from
  // @workspace/auth) so this package stays free of any auth dependency. May reject when signed
  // out, in which case the request is sent without a token.
  getAccessToken?: () => Promise<string>;
  children: React.ReactNode;
}

// Constructs the shared ky instance once per apiUrl/client pair (lazy useState initializer,
// not useMemo -- useMemo is not guaranteed stable across renders, and this instance must be).
// JSON:API headers are set at the instance level; ky's per-request `json:` option only sets
// Content-Type when one isn't already present, so it doesn't clobber this.
//
// `prefix`, not `baseUrl`: ky's option for prepending a base path to relative request paths is
// `prefix` (renamed from `prefixUrl` as of ky 2.0) -- `baseUrl` is a different option for
// resolving against a base when `input` is itself a URL. Using the wrong one here would send
// every request to a relative/wrong URL.
function ApiClientProvider({ apiUrl, getAccessToken, children }: ApiClientProviderProps) {
  // The ky instance is created once, so read the latest getter through a ref.
  const getAccessTokenRef = React.useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const [apiClient] = React.useState<KyInstance>(() =>
    ky.create({
      prefix: apiUrl,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      hooks: {
        beforeRequest: [
          async ({ request }) => {
            const token = await getAccessTokenRef.current?.().catch(() => undefined);
            if (token) {
              request.headers.set('Authorization', `Bearer ${token}`);
            }
          }
        ]
      }
    })
  );

  return <ApiClientContext.Provider value={apiClient}>{children}</ApiClientContext.Provider>;
}

function useApiClient(): KyInstance {
  const client = React.useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return client;
}

export { ApiClientProvider, useApiClient };
