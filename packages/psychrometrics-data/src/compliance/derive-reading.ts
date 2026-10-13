import { dewPointFromHumidityRatio } from '../physics/dew-point-from-humidity-ratio.js';
import { humidityRatio } from '../physics/humidity-ratio.js';
import { wetBulb } from '../physics/wet-bulb.js';
import type { Reading } from '../types/index.js';
import type { DerivedReading } from './types.js';

/** Computes humidity ratio, dew point and wet bulb from the reading's dry bulb and RH, keeping its own fields. */
export const deriveReading = (reading: Reading): DerivedReading => {
  const w = humidityRatio(reading.dryBulbC, reading.rhPct / 100);
  return {
    ...reading,
    humidityRatio: w,
    dewPointC: dewPointFromHumidityRatio(w),
    wetBulbC: wetBulb(reading.dryBulbC, w)
  };
};
