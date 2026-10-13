import type {
  Bound,
  ComplianceLevel,
  NearBoundWarning,
  Quantity,
  Violation
} from '@workspace/psychrometrics-data';

export const quantityLabels: Record<Quantity, string> = {
  dryBulb: 'Dry bulb',
  dewPoint: 'Dew point',
  relativeHumidity: 'Relative humidity',
  wetBulb: 'Wet bulb'
};

export const levelLabels: Record<ComplianceLevel, string> = {
  recommended: 'Recommended',
  allowable: 'Allowable',
  out: 'Out'
};

export const quantityUnit = (quantity: Quantity): string =>
  quantity === 'relativeHumidity' ? '%' : '°C';

const rounded = (value: number): string => {
  // Avoid "-0.0" for values that round to zero.
  const text = value.toFixed(1);
  return text === '-0.0' ? '0.0' : text;
};

export const formatQuantity = (quantity: Quantity, value: number): string => {
  const unit = quantityUnit(quantity);
  return `${rounded(value)}${unit === '%' ? ' %' : ` ${unit}`}`;
};

const formatLimit = ({ quantity, kind, limit }: Bound): string => {
  const unit = quantityUnit(quantity);
  return `${kind} ${limit}${unit === '%' ? ' %' : ` ${unit}`}`;
};

/** "18–27 °C", "up to 60 %", "from 5 °C" or "—" when neither bound is set. */
export const formatRange = (
  min: number | undefined,
  max: number | undefined,
  unit: string
): string => {
  if (min === undefined && max === undefined) return '—';
  if (min === undefined) return `up to ${max} ${unit}`;
  if (max === undefined) return `from ${min} ${unit}`;
  return `${min}–${max} ${unit}`;
};

/** The worst envelope each quantity breaks: allowable wins when both envelopes are broken. */
export const worstEnvelopes = (
  violations: readonly Violation[]
): Map<Quantity, Violation['envelope']> => {
  const worst = new Map<Quantity, Violation['envelope']>();
  for (const { quantity, envelope } of violations) {
    if (envelope === 'allowable' || !worst.has(quantity)) worst.set(quantity, envelope);
  }
  return worst;
};

/** "Dry bulb 26.5 °C is within 1 °C of max 27 °C" */
export const describeWarning = (warning: NearBoundWarning): string =>
  `${quantityLabels[warning.quantity]} ${formatQuantity(warning.quantity, warning.value)} is within ${
    warning.margin
  } ${quantityUnit(warning.quantity)} of ${formatLimit(warning)}`;

/** "2026-08-24 08:25 UTC": readings carry UTC timestamps, so show them as such. */
export const formatTimestamp = (timestamp: string): string =>
  `${timestamp.slice(0, 10)} ${timestamp.slice(11, 16)} UTC`;

export const formatAge = (ageMs: number): string => `${(ageMs / 1000).toFixed(1)} s`;
