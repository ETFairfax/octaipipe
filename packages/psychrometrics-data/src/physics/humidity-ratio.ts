import { humidityRatioFromVapourPressure } from './humidity-ratio-from-vapour-pressure.js';
import { saturationPressure } from './saturation-pressure.js';

export const humidityRatio = (tC: number, rh: number): number =>
  humidityRatioFromVapourPressure(rh * saturationPressure(tC));
