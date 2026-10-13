import { createPsychrometricsHandlers } from '@workspace/psychrometrics-data/mocks';

// Each domain's data package owns its handlers; the app only composes them for one API url.
// The data packages append `/path` to `apiUrl`, so a trailing slash in config.json
// (`https://host/`) would register `https://host//path`, which no request ever matches (ky's
// `prefix` collapses the double slash). Strip it once here.
export const createHandlers = (apiUrl: string) => {
  const baseUrl = apiUrl.replace(/\/+$/, '');
  return [...createPsychrometricsHandlers(baseUrl)];
};
