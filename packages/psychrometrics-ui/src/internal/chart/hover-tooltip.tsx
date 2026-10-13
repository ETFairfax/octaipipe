import { deriveReading } from '@workspace/psychrometrics-data';
import { formatQuantity, formatTimestamp } from '../format.js';
import type { HoverTarget } from '../geometry/hover.js';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-4'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='tabular-nums'>{value}</dd>
    </div>
  );
}

const grams = (w: number) => `${w.toFixed(2)} g/kg`;

export function HoverTooltip({ target }: { target: HoverTarget }) {
  if (target.kind === 'above-saturation') {
    return <p className='text-muted-foreground'>Above saturation</p>;
  }

  if (target.kind === 'reading') {
    const derived = deriveReading(target.reading);
    return (
      <div>
        <p className='mb-1 font-medium'>{formatTimestamp(derived.timestamp)}</p>
        <dl>
          <Row label='Dry bulb' value={formatQuantity('dryBulb', derived.dryBulbC)} />
          <Row label='Humidity ratio' value={grams(derived.humidityRatio * 1000)} />
          <Row label='Dew point' value={formatQuantity('dewPoint', derived.dewPointC)} />
          <Row label='RH' value={formatQuantity('relativeHumidity', derived.rhPct)} />
          <Row label='Wet bulb' value={formatQuantity('wetBulb', derived.wetBulbC)} />
        </dl>
      </div>
    );
  }

  return (
    <dl>
      <Row label='Dry bulb' value={formatQuantity('dryBulb', target.dryBulbC)} />
      <Row label='Humidity ratio' value={grams(target.w)} />
      <Row label='Dew point' value={formatQuantity('dewPoint', target.dewPointC)} />
      <Row label='RH' value={formatQuantity('relativeHumidity', target.rhPct)} />
      <Row label='Wet bulb' value={formatQuantity('wetBulb', target.wetBulbC)} />
    </dl>
  );
}
