import { createFileRoute, redirect } from '@tanstack/react-router';

const DEFAULT_SITE_ID = 'site-1';

export const Route = createFileRoute('/_app-shell/')({
  beforeLoad: () => {
    throw redirect({ to: '/$siteId', params: { siteId: DEFAULT_SITE_ID }, replace: true });
  }
});
