import { humidityRatioFromVapourPressure } from './humidity-ratio-from-vapour-pressure.js';
import { saturationPressure } from './saturation-pressure.js';

/** W along a dew-point line: independent of dry bulb, so the line is horizontal. */
export const humidityRatioAtDewPoint = (dewPointC: number): number =>
  humidityRatioFromVapourPressure(saturationPressure(dewPointC));
