import { type ScaleLinear, scaleLinear } from 'd3-scale';
import { type ChartDomain, type ChartPoint, chartDomain } from './chart-domain.js';

export type ChartLayout = {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
};

export const defaultLayout: ChartLayout = {
  width: 860,
  height: 560,
  margin: { top: 20, right: 70, bottom: 48, left: 58 }
};

export type ChartScales = {
  x: ScaleLinear<number, number>;
  y: ScaleLinear<number, number>;
  plot: { left: number; top: number; right: number; bottom: number; width: number; height: number };
  toPixel: (point: ChartPoint) => [number, number];
};

export const createScales = (
  layout: ChartLayout = defaultLayout,
  domain: ChartDomain = chartDomain
): ChartScales => {
  const { width, height, margin } = layout;
  const plot = {
    left: margin.left,
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom
  };
  const x = scaleLinear().domain([domain.tMin, domain.tMax]).range([plot.left, plot.right]);
  // Humidity ratio grows upwards, pixels grow downwards.
  const y = scaleLinear().domain([domain.wMin, domain.wMax]).range([plot.bottom, plot.top]);
  return { x, y, plot, toPixel: ({ t, w }) => [x(t), y(w)] };
};
