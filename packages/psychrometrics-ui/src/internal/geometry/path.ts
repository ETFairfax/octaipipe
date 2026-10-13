import type { ChartPoint } from './chart-domain.js';
import type { ChartScales } from './scales.js';

const format = (n: number) => n.toFixed(2);

/** An SVG path through the points; `closed` joins the last point back to the first. */
export const toPath = (points: ChartPoint[], { toPixel }: ChartScales, closed = false): string => {
  if (points.length === 0) return '';
  const commands = points.map((point, i) => {
    const [px, py] = toPixel(point);
    return `${i === 0 ? 'M' : 'L'}${format(px)},${format(py)}`;
  });
  return closed ? `${commands.join('')}Z` : commands.join('');
};
