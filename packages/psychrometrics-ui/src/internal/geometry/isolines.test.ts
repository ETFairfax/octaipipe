import { describe, expect, it } from 'vitest';
import { chartDomain } from './chart-domain.js';
import { clipPolyline } from './clip.js';
import {
  dewPointAxisTicks,
  relativeHumidityLines,
  saturationCurve,
  saturationShade,
  wetBulbLines
} from './isolines.js';
import { createScales } from './scales.js';

const { tMin, tMax, wMin, wMax } = chartDomain;
const withinPlot = (p: { t: number; w: number }) =>
  p.t >= tMin - 1e-9 && p.t <= tMax + 1e-9 && p.w >= wMin - 1e-9 && p.w <= wMax + 1e-9;

describe('clipPolyline', () => {
  it('cuts exactly at the edge and splits where the line leaves and re-enters', () => {
    const runs = clipPolyline(
      [
        { t: 12, w: 5 },
        { t: 20, w: 30 },
        { t: 30, w: 30 },
        { t: 35, w: 10 }
      ],
      chartDomain
    );

    expect(runs).toHaveLength(2);
    expect(runs[0]?.at(-1)?.w).toBeCloseTo(wMax);
    expect(runs[1]?.[0]?.w).toBeCloseTo(wMax);
  });
});

describe('isolines', () => {
  it('keeps the saturation curve inside the plot and exits it through the top', () => {
    const curve = saturationCurve();

    expect(curve.every(withinPlot)).toBe(true);
    expect(curve.at(-1)?.w).toBeCloseTo(wMax);
    expect(curve[0]?.t).toBe(tMin);
  });

  it('shades the region above the saturation curve', () => {
    const shade = saturationShade();

    expect(shade[0]).toEqual({ t: tMin, w: wMax });
    expect(shade.every(withinPlot)).toBe(true);
  });

  it('draws RH curves at 20/40/60/80 %, all inside the plot, ordered by humidity', () => {
    const lines = relativeHumidityLines();

    expect(lines.map(l => l.value)).toEqual([20, 40, 60, 80]);
    expect(lines.every(l => l.points.every(withinPlot))).toBe(true);
    const atFirstPoint = lines.map(l => l.points[0]?.w ?? 0);
    expect(atFirstPoint).toEqual([...atFirstPoint].sort((a, b) => a - b));
  });

  it('draws wet-bulb lines at 5 to 25 °C starting on the saturation curve', () => {
    const lines = wetBulbLines();

    expect(lines.map(l => l.value)).toEqual([5, 10, 15, 20, 25]);
    expect(lines.every(l => l.points.every(withinPlot))).toBe(true);
    // At dry bulb = wet bulb the air is saturated: the 20 °C line starts at W(20 °C, 100 %).
    const start = lines[3]?.points[0];
    expect(start?.t).toBe(20);
    expect(start?.w).toBeCloseTo(14.66, 1);
  });

  it('places the dew-point axis at the humidity ratio of saturation at that dew point', () => {
    const ticks = dewPointAxisTicks();

    expect(ticks.map(t => t.dewPointC)).toEqual([-10, -5, 0, 5, 10, 15, 20]);
    expect(ticks.find(t => t.dewPointC === 20)?.w).toBeCloseTo(14.66, 1);
    expect(ticks.every(t => t.w >= wMin && t.w <= wMax)).toBe(true);
  });
});

describe('scales', () => {
  it('maps the domain corners to the plot corners, with humidity ratio growing upwards', () => {
    const { x, y, plot } = createScales();

    expect(x(tMin)).toBe(plot.left);
    expect(x(tMax)).toBe(plot.right);
    expect(y(wMin)).toBe(plot.bottom);
    expect(y(wMax)).toBe(plot.top);
  });
});
