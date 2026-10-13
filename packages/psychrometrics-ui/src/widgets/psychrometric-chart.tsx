import type {
  AllowableEnvelope,
  ComplianceLevel,
  Envelope,
  Reading
} from '@workspace/psychrometrics-data';
import { type PointerEvent, useId, useMemo, useRef, useState } from 'react';
import { AxesLayer } from '../internal/chart/axes-layer.js';
import { HoverTooltip } from '../internal/chart/hover-tooltip.js';
import { IsolineLayer } from '../internal/chart/isoline-layer.js';
import { TrailLayer } from '../internal/chart/trail-layer.js';
import { ZoneLayer } from '../internal/chart/zone-layer.js';
import { type HoverTarget, resolveHover } from '../internal/geometry/hover.js';
import { createScales, defaultLayout } from '../internal/geometry/scales.js';
import { buildZone } from '../internal/geometry/zone.js';

const scales = createScales();
const { width, height } = defaultLayout;

export type PsychrometricChartProps = {
  envelope: Envelope;
  allowableEnvelope?: AllowableEnvelope;
  /** Oldest first; the last reading is the current one. */
  trail: Reading[];
  /** Colours the current point. */
  level?: ComplianceLevel;
  /** The trail is kept but dimmed: it may no longer match the hall. */
  stale?: boolean;
};

/**
 * A psychrometric chart with the site's envelopes shaded and a trail of readings. It draws what
 * it is given and knows nothing about where the readings come from.
 */
export function PsychrometricChart({
  envelope,
  allowableEnvelope,
  trail,
  level,
  stale = false
}: PsychrometricChartProps) {
  const clipId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [target, setTarget] = useState<HoverTarget | null>(null);

  const recommendedZone = useMemo(() => buildZone(envelope), [envelope]);
  const allowableZone = useMemo(
    () => (allowableEnvelope ? buildZone(allowableEnvelope) : undefined),
    [allowableEnvelope]
  );

  const onPointerMove = (event: PointerEvent<SVGRectElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    // The SVG scales with its container; convert from screen pixels back to the viewBox.
    const px = ((event.clientX - rect.left) * width) / rect.width;
    const py = ((event.clientY - rect.top) * height) / rect.height;
    setTarget(resolveHover(px, py, scales, trail));
  };

  return (
    // Width is capped so the chart's height (860:560 aspect) never exceeds the viewport.
    <div className='relative mx-auto w-full max-w-[calc((100svh-8rem)*860/560)] border'>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role='img'
        aria-label='Psychrometric chart'
        className='h-auto w-full select-none'
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={scales.plot.left}
              y={scales.plot.top}
              width={scales.plot.width}
              height={scales.plot.height}
            />
          </clipPath>
        </defs>
        <AxesLayer scales={scales} />
        <g clipPath={`url(#${clipId})`}>
          <IsolineLayer scales={scales} />
          <ZoneLayer scales={scales} recommended={recommendedZone} allowable={allowableZone} />
          <TrailLayer
            scales={scales}
            trail={trail}
            level={level}
            stale={stale}
            highlighted={target?.kind === 'reading' ? target.index : undefined}
          />
        </g>
        {target && (
          <g data-layer='crosshair' className='stroke-muted-foreground/60' pointerEvents='none'>
            <line x1={target.px} x2={target.px} y1={scales.plot.top} y2={scales.plot.bottom} />
            <line x1={scales.plot.left} x2={scales.plot.right} y1={target.py} y2={target.py} />
          </g>
        )}
        <rect
          data-layer='hover-overlay'
          x={scales.plot.left}
          y={scales.plot.top}
          width={scales.plot.width}
          height={scales.plot.height}
          fill='transparent'
          onPointerMove={onPointerMove}
          onPointerLeave={() => setTarget(null)}
        />
      </svg>
      {target && (
        <div
          role='tooltip'
          className='pointer-events-none absolute z-10 min-w-44 rounded-none border bg-popover p-2 text-xs text-popover-foreground shadow-md'
          style={{
            left: `${(target.px / width) * 100}%`,
            top: `${(target.py / height) * 100}%`,
            transform: `translate(${target.px > width * 0.6 ? 'calc(-100% - 14px)' : '14px'}, ${
              target.py > height * 0.6 ? 'calc(-100% - 14px)' : '14px'
            })`
          }}
        >
          <HoverTooltip target={target} />
        </div>
      )}
    </div>
  );
}
