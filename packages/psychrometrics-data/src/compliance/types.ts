export const complianceLevels = ['recommended', 'allowable', 'out'] as const;
export type ComplianceLevel = (typeof complianceLevels)[number];

export type Quantity = 'dryBulb' | 'dewPoint' | 'relativeHumidity' | 'wetBulb';

/** One lower or upper limit on one quantity. Relative humidity limits are in percent. */
export type Bound = { quantity: Quantity; kind: 'min' | 'max'; limit: number };

export type Violation = Bound & { envelope: 'recommended' | 'allowable'; value: number };
export type NearBoundWarning = Bound & { value: number; margin: number };

export type Compliance = {
  level: ComplianceLevel;
  /** Every bound the reading breaks, in the recommended envelope and in the allowable one. */
  violations: Violation[];
  /**
   * Bounds the reading is within the near-bound margin of, but has not crossed. Only bounds of the
   * envelope matching `level` are checked (recommended or allowable). Empty when level is `out`.
   */
  warnings: NearBoundWarning[];
};

/** A Reading plus the quantities derived from it, in the same units as the bounds (°C, % RH). */
export type DerivedReading = {
  timestamp: string;
  dryBulbC: number;
  rhPct: number;
  humidityRatio: number;
  dewPointC: number;
  wetBulbC: number;
};

/** How close to a bound counts as "near", per quantity (°C for temperatures, % for RH). */
export const nearBoundMargins: Record<Quantity, number> = {
  dryBulb: 1,
  dewPoint: 1,
  wetBulb: 1,
  relativeHumidity: 3
};
