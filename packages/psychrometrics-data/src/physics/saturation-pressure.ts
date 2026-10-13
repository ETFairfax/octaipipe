import { MAGNUS_A, MAGNUS_B, MAGNUS_P0_KPA } from './constants.js';

/** Saturation vapour pressure of water (Magnus). */
export const saturationPressure = (tC: number): number =>
  MAGNUS_P0_KPA * Math.exp((MAGNUS_A * tC) / (tC + MAGNUS_B));
