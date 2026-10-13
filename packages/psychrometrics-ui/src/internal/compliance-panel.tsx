import {
  type Compliance,
  deriveReading,
  type Reading,
  type Violation
} from '@workspace/psychrometrics-data';
import { Card, CardContent, CardHeader, CardTitle, ErrorAlert } from '@workspace/ui/components';
import { formatAge, formatQuantity, formatTimestamp, worstEnvelopes } from './format.js';
import { LevelBadge } from './level-badge.js';

const toneByEnvelope = {
  allowable: 'bg-destructive/15 text-destructive',
  recommended: 'bg-warning/20 text-warning'
} as const;

function Row({
  label,
  value,
  breach
}: {
  label: string;
  value: string;
  /** The worst envelope this value breaks, if any; tints the value. */
  breach?: Violation['envelope'];
}) {
  const tone = breach === undefined ? 'bg-muted' : toneByEnvelope[breach];
  return (
    <div className='flex items-center justify-between gap-4 py-2'>
      <dt>{label}</dt>
      <dd className={`min-w-24 rounded-none px-3 py-1 text-right text-base tabular-nums ${tone}`}>
        {value}
      </dd>
    </div>
  );
}

/** The current reading, its compliance level and every bound it breaks or approaches. */
export function CompliancePanel({
  reading,
  compliance,
  stale,
  ageMs
}: {
  reading: Reading;
  compliance: Compliance;
  stale: boolean;
  /** How long ago the reading arrived; shown while the feed is stale. */
  ageMs: number | null;
}) {
  const derived = deriveReading(reading);
  const { level, violations } = compliance;
  const worst = worstEnvelopes(violations);

  return (
    <Card size='sm'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between gap-2'>
          <span>{stale ? 'Last reading' : 'Current reading'}</span>
          <LevelBadge level={level} lastKnown={stale} />
        </CardTitle>
        <p className='text-muted-foreground'>{formatTimestamp(reading.timestamp)}</p>
        {stale && (
          <ErrorAlert
            message='Feed interrupted'
            description={
              ageMs === null ? 'Retrying…' : `Reading is ${formatAge(ageMs)} old. Retrying…`
            }
          />
        )}
      </CardHeader>
      <CardContent className={stale ? 'flex flex-col gap-3 opacity-60' : 'flex flex-col gap-3'}>
        <dl className='divide-y divide-border border-y'>
          <Row
            label='Dry bulb'
            value={formatQuantity('dryBulb', derived.dryBulbC)}
            breach={worst.get('dryBulb')}
          />
          <Row
            label='Wet bulb'
            value={formatQuantity('wetBulb', derived.wetBulbC)}
            breach={worst.get('wetBulb')}
          />
          <Row
            label='Relative humidity'
            value={formatQuantity('relativeHumidity', derived.rhPct)}
            breach={worst.get('relativeHumidity')}
          />
          <Row
            label='Dew point'
            value={formatQuantity('dewPoint', derived.dewPointC)}
            breach={worst.get('dewPoint')}
          />
          <Row label='Humidity ratio' value={`${(derived.humidityRatio * 1000).toFixed(2)} g/kg`} />
        </dl>
      </CardContent>
    </Card>
  );
}
