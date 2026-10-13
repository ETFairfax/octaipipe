import type { Envelope } from '@workspace/psychrometrics-data';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components';
import { formatRange } from './format.js';

type EnvelopeRow = { label: string; range: string };

// Quantities with no bound in either direction are left out rather than shown as "—".
const envelopeRows = (envelope: Envelope): EnvelopeRow[] =>
  [
    { label: 'Dry bulb', min: envelope.dryBulbMinC, max: envelope.dryBulbMaxC, unit: '°C' },
    { label: 'Relative humidity', min: envelope.rhMinPct, max: envelope.rhMaxPct, unit: '%' },
    { label: 'Dew point', min: envelope.dewPointMinC, max: envelope.dewPointMaxC, unit: '°C' },
    { label: 'Wet bulb', min: envelope.wetBulbMinC, max: envelope.wetBulbMaxC, unit: '°C' }
  ]
    .filter(({ min, max }) => min !== undefined || max !== undefined)
    .map(({ label, min, max, unit }) => ({ label, range: formatRange(min, max, unit) }));

/** One envelope's bounds as numbers; the chart only shows them as shaded zones. */
export function EnvelopeCard({
  title,
  envelope
}: {
  /** Which envelope this is, e.g. "Recommended envelope". */
  title: string;
  envelope: Envelope;
}) {
  const rows = envelopeRows(envelope);

  return (
    <Card size='sm'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {envelope.label && <p className='text-muted-foreground'>{envelope.label}</p>}
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <dl className='divide-y divide-border border-y'>
            {rows.map(({ label, range }) => (
              <div key={label} className='flex items-center justify-between gap-4 py-2'>
                <dt>{label}</dt>
                <dd className='tabular-nums'>{range}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className='text-muted-foreground'>No limits set.</p>
        )}
      </CardContent>
    </Card>
  );
}
