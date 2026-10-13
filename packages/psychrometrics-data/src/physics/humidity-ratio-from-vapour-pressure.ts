import { ATMOSPHERIC_PRESSURE_KPA, WATER_TO_AIR_MOLAR_MASS_RATIO } from './constants.js';

/** Humidity ratio W of air holding water vapour at partial pressure `pw`. */
export const humidityRatioFromVapourPressure = (pw: number): number =>
  (WATER_TO_AIR_MOLAR_MASS_RATIO * pw) / (ATMOSPHERIC_PRESSURE_KPA - pw);
