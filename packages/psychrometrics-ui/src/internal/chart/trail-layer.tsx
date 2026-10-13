import { type ComplianceLevel, humidityRatio, type Reading } from '@workspace/psychrometrics-data';
import { toGPerKg } from '../geometry/chart-domain.js';
import type { ChartScales } from '../geometry/scales.js';

export const levelFill: Record<ComplianceLevel, string> = {
  recommended: 'fill-success',
  allowable: 'fill-warning',
  out: 'fill-destructive'
};

const markerPoint = (reading: Reading) => ({
  t: reading.dryBulbC,
  w: toGPerKg(humidityRatio(reading.dryBulbC, reading.rhPct / 100))
});

/**
 * The trail, oldest first, fading with age, and the current reading on top coloured by its
 * compliance level. A stale trail keeps its place but is dimmed.
 */
export function TrailLayer({
  scales,
  trail,
  level,
  stale,
  highlighted
}: {
  scales: ChartScales;
  trail: Reading[];
  level: ComplianceLevel | undefined;
  stale: boolean;
  highlighted: number | undefined;
}) {
  if (trail.length === 0) return null;
  const pixels = trail.map(reading => scales.toPixel(markerPoint(reading)));
  const lastIndex = trail.length - 1;

  return (
    <g data-layer='trail' data-stale={stale} className={stale ? 'opacity-40' : undefined}>
      <polyline
        points={pixels.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')}
        className='fill-none stroke-foreground/40'
      />
      {pixels.map(([px, py], index) => {
        const isCurrent = index === lastIndex;
        // Older markers are fainter; the oldest of a full trail is still visible.
        const age = lastIndex === 0 ? 1 : index / lastIndex;
        return (
          <circle
            key={trail[index]?.timestamp}
            data-marker={isCurrent ? 'current' : 'trail'}
            cx={px}
            cy={py}
            r={isCurrent ? 7 : 4}
            opacity={isCurrent ? 1 : 0.2 + 0.6 * age}
            className={`stroke-background stroke-2 ${
              isCurrent && level ? levelFill[level] : 'fill-foreground'
            }`}
          />
        );
      })}
      {highlighted !== undefined && pixels[highlighted] && (
        <circle
          cx={pixels[highlighted][0]}
          cy={pixels[highlighted][1]}
          r={10}
          className='fill-none stroke-foreground stroke-2'
        />
      )}
      {stale && (
        <circle
          cx={pixels[lastIndex]?.[0]}
          cy={pixels[lastIndex]?.[1]}
          r={11}
          className='fill-none stroke-destructive [stroke-dasharray:3_3]'
        />
      )}
    </g>
  );
}
