import {
  humidityRatio,
  humidityRatioAtDewPoint,
  humidityRatioAtWetBulb
} from '@workspace/psychrometrics-data';
import {
  type ChartDomain,
  type ChartPoint,
  chartDomain,
  dewPointTicks,
  relativeHumidityIsolines,
  toGPerKg,
  wetBulbIsolines
} from './chart-domain.js';
import { clipPolyline } from './clip.js';

const SAMPLE_STEP_C = 0.1;

export type Isoline = {
  /** Value of the isoline: percent for relative humidity, °C for wet bulb. */
  value: number;
  label: string;
  /** Clipped to the plot; the last point is where the line exits. */
  points: ChartPoint[];
};

const temperatures = (from: number, to: number): number[] => {
  const count = Math.ceil((to - from) / SAMPLE_STEP_C);
  return Array.from({ length: count + 1 }, (_, i) => Math.min(from + i * SAMPLE_STEP_C, to));
};

const sample = (from: number, to: number, w: (t: number) => number): ChartPoint[] =>
  temperatures(from, to).map(t => ({ t, w: toGPerKg(w(t)) }));

// A monotone curve crosses the plot once, so the first run is the whole visible curve.
const visible = (points: ChartPoint[], domain: ChartDomain): ChartPoint[] =>
  clipPolyline(points, domain)[0] ?? [];

export const saturationCurve = (domain: ChartDomain = chartDomain): ChartPoint[] =>
  visible(
    sample(domain.tMin, domain.tMax, t => humidityRatio(t, 1)),
    domain
  );

/** The region above the saturation curve, which no air can occupy. */
export const saturationShade = (domain: ChartDomain = chartDomain): ChartPoint[] => {
  const curve = saturationCurve(domain);
  const last = curve.at(-1);
  if (!last) return [];
  return [{ t: domain.tMin, w: domain.wMax }, ...curve, { t: last.t, w: domain.wMax }];
};

export const relativeHumidityLines = (domain: ChartDomain = chartDomain): Isoline[] =>
  relativeHumidityIsolines.map(rhPct => ({
    value: rhPct,
    label: `${rhPct}%`,
    points: visible(
      sample(domain.tMin, domain.tMax, t => humidityRatio(t, rhPct / 100)),
      domain
    )
  }));

/** Wet-bulb lines start on the saturation curve, where dry bulb equals wet bulb. */
export const wetBulbLines = (domain: ChartDomain = chartDomain): Isoline[] =>
  wetBulbIsolines.map(wetBulbC => ({
    value: wetBulbC,
    label: `${wetBulbC}°`,
    points: visible(
      sample(Math.max(wetBulbC, domain.tMin), domain.tMax, t =>
        humidityRatioAtWetBulb(t, wetBulbC)
      ),
      domain
    )
  }));

/** The right-hand axis: dew point is a monotone function of humidity ratio at fixed pressure. */
export const dewPointAxisTicks = (): { dewPointC: number; w: number }[] =>
  dewPointTicks.map(dewPointC => ({ dewPointC, w: toGPerKg(humidityRatioAtDewPoint(dewPointC)) }));
