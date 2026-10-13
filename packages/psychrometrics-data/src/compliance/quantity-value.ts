import type { DerivedReading, Quantity } from './types.js';

/** Returns the derived reading's value for a quantity, e.g. 'dewPoint' gives dewPointC. */
export const quantityValue = (derived: DerivedReading, quantity: Quantity): number => {
  switch (quantity) {
    case 'dryBulb':
      return derived.dryBulbC;
    case 'dewPoint':
      return derived.dewPointC;
    case 'relativeHumidity':
      return derived.rhPct;
    case 'wetBulb':
      return derived.wetBulbC;
  }
};
