import { setupServer } from 'msw/node';
import { createHandlers } from './handlers.ts';

// Tests have no runtime config document, so they pin the API url here.
export const TEST_API_URL = 'https://my-api.com';

export const server = setupServer(...createHandlers(TEST_API_URL));
