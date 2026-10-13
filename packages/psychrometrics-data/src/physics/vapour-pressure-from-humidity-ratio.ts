import { ATMOSPHERIC_PRESSURE_KPA, WATER_TO_AIR_MOLAR_MASS_RATIO } from './constants.js';

/** Partial pressure of water vapour for a chart position. */
export const vapourPressureFromHumidityRatio = (w: number): number =>
  (w * ATMOSPHERIC_PRESSURE_KPA) / (WATER_TO_AIR_MOLAR_MASS_RATIO + w);
