import { saturationPressure } from './saturation-pressure.js';
import { vapourPressureFromHumidityRatio } from './vapour-pressure-from-humidity-ratio.js';

export const relativeHumidity = (tC: number, w: number): number =>
  vapourPressureFromHumidityRatio(w) / saturationPressure(tC);
