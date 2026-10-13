import { memo } from 'react';
import type { ChartPoint } from '../geometry/chart-domain.js';
import {
  type Isoline,
  relativeHumidityLines,
  saturationCurve,
  saturationShade,
  wetBulbLines
} from '../geometry/isolines.js';
import { toPath } from '../geometry/path.js';
import type { ChartScales } from '../geometry/scales.js';

const LABEL_INSET_PX = 16;

// Labels sit just inside the plot where the line exits, turned to follow it, with a halo so the
// text stays legible over other lines.
function IsolineLabel({
  points,
  scales,
  text,
  className
}: {
  points: ChartPoint[];
  scales: ChartScales;
  text: string;
  className: string;
}) {
  const end = points.at(-1);
  const before = points.at(-2);
  if (!end || !before) return null;
  const [ex, ey] = scales.toPixel(end);
  const [bx, by] = scales.toPixel(before);
  const length = Math.hypot(ex - bx, ey - by) || 1;
  const x = ex - ((ex - bx) / length) * LABEL_INSET_PX;
  const y = ey - ((ey - by) / length) * LABEL_INSET_PX;
  let angle = (Math.atan2(ey - by, ex - bx) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  return (
    <text
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})`}
      textAnchor='middle'
      dy={-3}
      className={`stroke-background stroke-[3px] text-[10px] [paint-order:stroke] ${className}`}
    >
      {text}
    </text>
  );
}

function Lines({
  lines,
  scales,
  kind,
  lineClass,
  labelClass
}: {
  lines: Isoline[];
  scales: ChartScales;
  kind: string;
  lineClass: string;
  labelClass: string;
}) {
  return (
    <g data-layer={kind}>
      {lines.map(line => (
        <g key={line.value} data-isoline={`${kind}-${line.value}`}>
          <path d={toPath(line.points, scales)} className={`fill-none ${lineClass}`} />
          <IsolineLabel
            points={line.points}
            scales={scales}
            text={line.label}
            className={labelClass}
          />
        </g>
      ))}
    </g>
  );
}

const rhLines = relativeHumidityLines();
const wbLines = wetBulbLines();
const saturation = saturationCurve();
const shade = saturationShade();

export const IsolineLayer = memo(function IsolineLayer({ scales }: { scales: ChartScales }) {
  return (
    <g>
      <path
        data-layer='saturation-shade'
        d={toPath(shade, scales, true)}
        className='fill-muted-foreground/20 stroke-none'
      />
      <Lines
        lines={rhLines}
        scales={scales}
        kind='relative-humidity'
        lineClass='stroke-primary/60'
        labelClass='fill-primary'
      />
      <Lines
        lines={wbLines}
        scales={scales}
        kind='wet-bulb'
        lineClass='stroke-muted-foreground stroke-[0.75px] [stroke-dasharray:4_3]'
        labelClass='fill-muted-foreground'
      />
      <g data-layer='saturation-curve'>
        <path
          d={toPath(saturation, scales)}
          className='fill-none stroke-foreground stroke-[1.5px]'
        />
        <IsolineLabel
          points={saturation}
          scales={scales}
          text='100% RH'
          className='fill-foreground'
        />
      </g>
    </g>
  );
});
