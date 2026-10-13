import { MAGNUS_A, MAGNUS_B, MAGNUS_P0_KPA } from './constants.js';

/** Inverse Magnus: the temperature at which `pw` is the saturation pressure. */
export const dewPointFromVapourPressure = (pw: number): number => {
  const a = Math.log(pw / MAGNUS_P0_KPA);
  return (MAGNUS_B * a) / (MAGNUS_A - a);
};
