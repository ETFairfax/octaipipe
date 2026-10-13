import { WET_BULB_TOLERANCE_C } from './constants.js';
import { dewPointFromHumidityRatio } from './dew-point-from-humidity-ratio.js';
import { humidityRatioAtWetBulb } from './humidity-ratio-at-wet-bulb.js';

/**
 * Wet-bulb temperature of a dry-bulb / humidity-ratio position, by bisection between the dew
 * point and the dry bulb. W along the dry bulb's wet-bulb relation rises with wet bulb, so the
 * root is bracketed there.
 */
export const wetBulb = (tC: number, w: number): number => {
  let low = Math.min(dewPointFromHumidityRatio(w), tC);
  let high = tC;
  while (high - low > WET_BULB_TOLERANCE_C) {
    const mid = (low + high) / 2;
    if (humidityRatioAtWetBulb(tC, mid) < w) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
};
