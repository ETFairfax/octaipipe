export const psychrometricsKeys = {
  all: ['psychrometrics'] as const, // Root key e.g ['psychrometrics']
  sites: () => [...psychrometricsKeys.all, 'site'] as const, // All sites e.g ['psychrometrics', 'site']
  site: (siteId: string) => [...psychrometricsKeys.sites(), siteId] as const, // One site e.g ['psychrometrics', 'site', 'site-1']
  reading: (siteId: string) => [...psychrometricsKeys.all, 'reading', siteId] as const // The polled trail of recent readings of one site
};
