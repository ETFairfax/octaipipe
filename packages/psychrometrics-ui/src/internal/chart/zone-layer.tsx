import type { ChartPoint } from '../geometry/chart-domain.js';
import { toPath } from '../geometry/path.js';
import type { ChartScales } from '../geometry/scales.js';

// The allowable zone is drawn first, as the outer region; the recommended zone sits inside it.
export function ZoneLayer({
  scales,
  recommended,
  allowable
}: {
  scales: ChartScales;
  recommended: ChartPoint[][];
  allowable: ChartPoint[][] | undefined;
}) {
  return (
    <g>
      {allowable && (
        <path
          data-layer='allowable-zone'
          d={allowable.map(ring => toPath(ring, scales, true)).join('')}
          className='fill-warning/15 stroke-warning stroke-1 [stroke-dasharray:5_3]'
        />
      )}
      <path
        data-layer='recommended-zone'
        d={recommended.map(ring => toPath(ring, scales, true)).join('')}
        className='fill-success/25 stroke-success stroke-[1.5px]'
      />
    </g>
  );
}
