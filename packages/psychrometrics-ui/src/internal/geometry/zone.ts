import {
  type Envelope,
  envelopeBounds,
  humidityRatio,
  humidityRatioAtDewPoint,
  humidityRatioAtWetBulb
} from '@workspace/psychrometrics-data';
import { type ChartDomain, type ChartPoint, chartDomain, toGPerKg } from './chart-domain.js';

// A curve of humidity ratio (g/kg) against dry bulb (°C).
type Curve = (t: number) => number;

const GRID_STEP_C = 0.05;
const BISECTION_STEPS = 50;
const EPSILON = 1e-9;

const dedupe = (sorted: number[]): number[] =>
  sorted.filter((value, i) => i === 0 || value - (sorted[i - 1] ?? value) > EPSILON);

// Root of f on [a, b], given that f changes sign there.
const bisect = (f: Curve, a: number, b: number): number => {
  let low = a;
  let high = b;
  const lowSign = Math.sign(f(low));
  for (let i = 0; i < BISECTION_STEPS; i++) {
    const mid = (low + high) / 2;
    if (Math.sign(f(mid)) === lowSign) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
};

// Every t in (a, b) grid cells where `f` changes sign.
const crossings = (f: Curve, grid: number[]): number[] =>
  grid.flatMap((t, i) => {
    const next = grid[i + 1];
    if (next === undefined) return [];
    return f(t) * f(next) < 0 ? [bisect(f, t, next)] : [];
  });

/**
 * The region of the chart that satisfies every bound of an envelope, as closed polygons (usually
 * one; contradictory bounds give none, and bounds that separate the region give several).
 *
 * At each dry bulb T the allowed humidity ratios form an interval: its floor is the highest
 * lower bound and its ceiling the lowest upper bound, each expressed as a humidity ratio. Dry-bulb
 * bounds are vertical edges and just clamp the T range. The saturation curve and the top of the
 * plot always cap the ceiling, and zero floors it, so an absent key simply leaves that edge to
 * saturation or zero. The polygon runs along the ceiling and back along the floor, over the T
 * where the interval is not empty. Points are added exactly where two lower bounds, two upper
 * bounds or floor and ceiling cross, so the corners are sharp rather than rounded off by sampling.
 */
export const buildZone = (
  envelope: Envelope,
  domain: ChartDomain = chartDomain
): ChartPoint[][] => {
  let tLow = domain.tMin;
  let tHigh = domain.tMax;
  const floors: Curve[] = [() => domain.wMin];
  const ceilings: Curve[] = [t => toGPerKg(humidityRatio(t, 1)), () => domain.wMax];

  for (const { quantity, kind, limit } of envelopeBounds(envelope)) {
    if (quantity === 'dryBulb') {
      if (kind === 'min') tLow = Math.max(tLow, limit);
      else tHigh = Math.min(tHigh, limit);
      continue;
    }
    const curve: Curve = (() => {
      switch (quantity) {
        case 'dewPoint': {
          const w = toGPerKg(humidityRatioAtDewPoint(limit));
          return () => w;
        }
        case 'relativeHumidity':
          return t => toGPerKg(humidityRatio(t, limit / 100));
        case 'wetBulb':
          return t => toGPerKg(humidityRatioAtWetBulb(t, limit));
      }
    })();
    (kind === 'min' ? floors : ceilings).push(curve);
  }
  if (tLow > tHigh) return [];

  const floor: Curve = t => Math.max(...floors.map(f => f(t)));
  const ceiling: Curve = t => Math.min(...ceilings.map(f => f(t)));
  const gap: Curve = t => ceiling(t) - floor(t);

  const steps = Math.max(1, Math.ceil((tHigh - tLow) / GRID_STEP_C));
  const grid = Array.from({ length: steps + 1 }, (_, i) =>
    Math.min(tLow + (i * (tHigh - tLow)) / steps, tHigh)
  );

  const pairs = (curves: Curve[]) =>
    curves.flatMap((a, i) => curves.slice(i + 1).flatMap(b => crossings(t => a(t) - b(t), grid)));
  const ts = dedupe(
    [...grid, ...crossings(gap, grid), ...pairs(floors), ...pairs(ceilings)].sort((a, b) => a - b)
  );

  // Maximal runs of consecutive samples with a non-empty interval. A gap that closes and reopens
  // splits the region rather than bridging the closed part.
  const runs: number[][] = [];
  let run: number[] = [];
  for (const t of ts) {
    if (gap(t) >= -EPSILON) run.push(t);
    else {
      runs.push(run);
      run = [];
    }
  }
  runs.push(run);

  return runs
    .filter(points => points.length >= 2)
    .map(points => {
      const top = points.map(t => ({ t, w: ceiling(t) }));
      const bottom = points.map(t => ({ t, w: floor(t) })).reverse();
      return [...top, ...bottom].filter(
        (p, i, all) =>
          i === 0 ||
          Math.abs(p.t - (all[i - 1]?.t ?? p.t)) > EPSILON ||
          Math.abs(p.w - (all[i - 1]?.w ?? p.w)) > EPSILON
      );
    });
};
