import { dewPointFromVapourPressure } from './dew-point-from-vapour-pressure.js';
import { vapourPressureFromHumidityRatio } from './vapour-pressure-from-humidity-ratio.js';

export const dewPointFromHumidityRatio = (w: number): number =>
  dewPointFromVapourPressure(vapourPressureFromHumidityRatio(w));
