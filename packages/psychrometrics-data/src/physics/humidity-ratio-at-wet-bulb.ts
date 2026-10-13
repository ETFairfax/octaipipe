import { humidityRatioFromVapourPressure } from './humidity-ratio-from-vapour-pressure.js';
import { saturationPressure } from './saturation-pressure.js';

/** W along a wet-bulb isoline (ASHRAE psychrometric relation): explicit in dry bulb. */
export const humidityRatioAtWetBulb = (tC: number, wetBulbC: number): number => {
  const ws = humidityRatioFromVapourPressure(saturationPressure(wetBulbC));
  return (
    ((2501 - 2.326 * wetBulbC) * ws - 1.006 * (tC - wetBulbC)) /
    (2501 + 1.86 * tC - 4.186 * wetBulbC)
  );
};
