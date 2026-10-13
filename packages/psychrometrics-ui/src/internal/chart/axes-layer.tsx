import { memo } from 'react';
import { dryBulbTicks, humidityRatioTicks } from '../geometry/chart-domain.js';
import { dewPointAxisTicks } from '../geometry/isolines.js';
import type { ChartScales } from '../geometry/scales.js';

const tickLabel = 'fill-muted-foreground text-[11px]';

export const AxesLayer = memo(function AxesLayer({ scales }: { scales: ChartScales }) {
  const { x, y, plot } = scales;
  return (
    <g data-layer='axes'>
      <g className='stroke-border'>
        {dryBulbTicks.map(t => (
          <line key={t} x1={x(t)} x2={x(t)} y1={plot.top} y2={plot.bottom} />
        ))}
        {humidityRatioTicks.map(w => (
          <line key={w} x1={plot.left} x2={plot.right} y1={y(w)} y2={y(w)} />
        ))}
      </g>
      <rect
        x={plot.left}
        y={plot.top}
        width={plot.width}
        height={plot.height}
        className='fill-none stroke-muted-foreground'
      />

      {dryBulbTicks.map(t => (
        <text key={t} x={x(t)} y={plot.bottom + 16} textAnchor='middle' className={tickLabel}>
          {t}
        </text>
      ))}
      <text
        x={(plot.left + plot.right) / 2}
        y={plot.bottom + 38}
        textAnchor='middle'
        className='fill-foreground text-xs'
      >
        Dry-bulb temperature (°C)
      </text>

      {humidityRatioTicks.map(w => (
        <text key={w} x={plot.left - 8} y={y(w) + 4} textAnchor='end' className={tickLabel}>
          {w}
        </text>
      ))}
      <text
        transform={`translate(14 ${(plot.top + plot.bottom) / 2}) rotate(-90)`}
        textAnchor='middle'
        className='fill-foreground text-xs'
      >
        Humidity ratio (g/kg dry air)
      </text>

      {/* Right-hand axis: dew point, placed at the humidity ratio of saturation at that dew point. */}
      <g className='stroke-muted-foreground'>
        {dewPointAxisTicks().map(({ dewPointC, w }) => (
          <line key={dewPointC} x1={plot.right} x2={plot.right + 5} y1={y(w)} y2={y(w)} />
        ))}
      </g>
      {dewPointAxisTicks().map(({ dewPointC, w }) => (
        <text
          key={dewPointC}
          data-axis='dew-point'
          x={plot.right + 9}
          y={y(w) + 4}
          className={tickLabel}
        >
          {dewPointC}
        </text>
      ))}
      <text
        transform={`translate(${plot.right + 52} ${(plot.top + plot.bottom) / 2}) rotate(90)`}
        textAnchor='middle'
        className='fill-foreground text-xs'
      >
        Dew point (°C)
      </text>
    </g>
  );
});
