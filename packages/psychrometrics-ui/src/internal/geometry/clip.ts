import type { ChartDomain, ChartPoint } from './chart-domain.js';

// Liang-Barsky clip of one segment to the domain; undefined when it misses the rectangle.
const clipSegment = (
  a: ChartPoint,
  b: ChartPoint,
  { tMin, tMax, wMin, wMax }: ChartDomain
): [ChartPoint, ChartPoint] | undefined => {
  const dt = b.t - a.t;
  const dw = b.w - a.w;
  const checks: [number, number][] = [
    [-dt, a.t - tMin],
    [dt, tMax - a.t],
    [-dw, a.w - wMin],
    [dw, wMax - a.w]
  ];
  let enter = 0;
  let leave = 1;
  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return undefined;
    } else {
      const r = q / p;
      if (p < 0) enter = Math.max(enter, r);
      else leave = Math.min(leave, r);
    }
  }
  if (enter > leave) return undefined;
  return [
    { t: a.t + enter * dt, w: a.w + enter * dw },
    { t: a.t + leave * dt, w: a.w + leave * dw }
  ];
};

const samePoint = (a: ChartPoint, b: ChartPoint) =>
  Math.abs(a.t - b.t) < 1e-9 && Math.abs(a.w - b.w) < 1e-9;

/**
 * Clips a polyline to the plot. Returns the visible runs, each cut exactly at the edge it
 * crosses, so the last point of a run that leaves the plot is the exit point.
 */
export const clipPolyline = (points: ChartPoint[], domain: ChartDomain): ChartPoint[][] => {
  const runs: ChartPoint[][] = [];
  let run: ChartPoint[] = [];
  const close = () => {
    if (run.length >= 2) runs.push(run);
    run = [];
  };

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (!a || !b) continue;
    const clipped = clipSegment(a, b, domain);
    if (!clipped) {
      close();
      continue;
    }
    const [start, end] = clipped;
    const last = run.at(-1);
    if (!last || !samePoint(last, start)) {
      close();
      run.push(start);
    }
    run.push(end);
  }
  close();
  return runs;
};
