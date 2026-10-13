import {
  evaluateReading,
  useGetSite,
  useGetSites,
  useSiteFeed
} from '@workspace/psychrometrics-data';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ErrorAlert,
  InfoAlert,
  NativeSelect,
  Skeleton,
  Spinner
} from '@workspace/ui/components';
import { CompliancePanel } from '../internal/compliance-panel.js';
import { EnvelopeCard } from '../internal/envelope-card.js';
import { PsychrometricChart } from '../widgets/psychrometric-chart.js';

// One site's live view. Mounted with `key={siteId}` so switching sites starts a fresh trail.
function SiteView({ siteId }: { siteId: string }) {
  const { data: site, isError, error } = useGetSite(siteId);
  const { trail, current, status, ageMs, isSlow, replay } = useSiteFeed(siteId);

  if (isError) {
    return <ErrorAlert message='Could not load the site' description={error.message} />;
  }

  if (!site) return <Skeleton className='aspect-860/560 w-full' />;

  const stale = status === 'stale';
  const compliance = current ? evaluateReading(current, site) : undefined;

  return (
    <section className='flex flex-col gap-3'>
      {status === 'ended' && (
        <InfoAlert
          message='Feed ended'
          description='There are no more readings for this site. The last one stays on the chart.'
        >
          <Button size='sm' onClick={replay}>
            Replay
          </Button>
        </InfoAlert>
      )}
      {isSlow && !stale && (
        <Alert>
          <AlertTitle className='flex items-center gap-2'>
            <Spinner className='size-3' /> Slow response from the feed
          </AlertTitle>
          <AlertDescription>Waiting for the next reading.</AlertDescription>
        </Alert>
      )}
      {/* On ultra-wide screens the chart group dissolves (`contents`) so the chart, the reading
          and the stacked envelope cards share one row. */}
      <div className='flex flex-col gap-3 min-[110rem]:grid min-[110rem]:grid-cols-[minmax(0,calc((100svh-8rem)*860/560))_repeat(2,minmax(0,1fr))] min-[110rem]:items-start min-[110rem]:gap-4'>
        <div className='grid items-start gap-4 min-[110rem]:contents lg:grid-cols-[minmax(0,1fr)_20rem]'>
          {status === 'loading' ? (
            <Skeleton
              aria-label='Waiting for the first reading'
              className='mx-auto aspect-860/560 w-full max-w-[calc((100svh-8rem)*860/560)]'
            />
          ) : (
            <PsychrometricChart
              envelope={site.envelope}
              allowableEnvelope={site.allowableEnvelope}
              trail={trail}
              level={compliance?.level}
              stale={stale}
            />
          )}
          {current && compliance ? (
            <CompliancePanel
              reading={current}
              compliance={compliance}
              stale={stale}
              ageMs={ageMs}
            />
          ) : stale ? (
            <ErrorAlert
              message='Cannot reach the feed'
              description='No reading has arrived yet. Retrying every second.'
            />
          ) : (
            <Skeleton className='h-48 w-full' />
          )}
        </div>
        <div className='grid items-start gap-4 md:grid-cols-2 min-[110rem]:flex min-[110rem]:flex-col min-[110rem]:items-stretch'>
          <EnvelopeCard title='Recommended envelope' envelope={site.envelope} />
          {site.allowableEnvelope && (
            <EnvelopeCard title='Allowable envelope' envelope={site.allowableEnvelope} />
          )}
        </div>
      </div>
    </section>
  );
}

type PsychrometricsPageProps = {
  /** The site to show. An id the feed does not know shows the site's load error. */
  siteId: string;
  onSiteChange: (siteId: string) => void;
};

export function PsychrometricsPage({ siteId, onSiteChange }: PsychrometricsPageProps) {
  const sitesQuery = useGetSites();

  if (sitesQuery.isError) {
    return <ErrorAlert message='Could not load the sites' description={sitesQuery.error.message} />;
  }

  const sites = sitesQuery.data;

  return (
    <div className='flex flex-col gap-4 p-4'>
      <header className='flex items-center justify-between gap-4'>
        <h1 className='font-heading text-base font-medium'>Psychrometrics</h1>
        {sites && sites.length > 1 && (
          <div className='flex items-center gap-2'>
            <label htmlFor='psychrometrics-site' className='text-muted-foreground'>
              Site
            </label>
            <NativeSelect
              value={siteId}
              onChange={event => onSiteChange(event.target.value)}
              id='psychrometrics-site'
            >
              {sites.map(site => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}
      </header>
      <SiteView key={siteId} siteId={siteId} />
    </div>
  );
}
