import type { Reading, Site } from '../types/index.js';
import { deriveReading } from './derive-reading.js';
import type { Compliance } from './types.js';
import { violationsOf } from './violations-of.js';
import { warningsOf } from './warnings-of.js';

/**
 * Classifies a reading against a site's envelopes. Level is recommended if it breaks no
 * recommended limit; allowable if it breaks a recommended limit but the site has an allowable
 * envelope and no allowable limit is broken; otherwise out. Near-limit warnings are taken from the
 * envelope that gave the level, and are empty when out.
 */
export const evaluateReading = (reading: Reading, site: Site): Compliance => {
  const derived = deriveReading(reading);
  const recommended = violationsOf(derived, site.envelope, 'recommended');
  const allowable = site.allowableEnvelope
    ? violationsOf(derived, site.allowableEnvelope, 'allowable')
    : [];
  const violations = [...recommended, ...allowable];

  if (recommended.length === 0) {
    return { level: 'recommended', violations, warnings: warningsOf(derived, site.envelope) };
  }
  if (site.allowableEnvelope && allowable.length === 0) {
    return {
      level: 'allowable',
      violations,
      warnings: warningsOf(derived, site.allowableEnvelope)
    };
  }
  return { level: 'out', violations, warnings: [] };
};
