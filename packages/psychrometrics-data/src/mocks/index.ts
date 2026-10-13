// Dev and test only (`@workspace/psychrometrics-data/mocks`): never import this from
// `src/index.ts`, so msw stays out of production bundles. The bundled fixture is parsed here so
// tests share the file the app reads.

import { ConditionsFileSchema } from '../types/index.js';
import conditionsJson from './conditions.json';

export { createPsychrometricsHandlers } from './handlers.js';
export const psychrometricsFixtures = ConditionsFileSchema.parse(conditionsJson);
