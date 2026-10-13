import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { ApiClientProvider } from '@workspace/api-client';
import {
  createPsychrometricsHandlers,
  psychrometricsFixtures
} from '@workspace/psychrometrics-data/mocks';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PsychrometricsPage } from './psychrometrics-page.js';

const apiUrl = 'https://api.test';
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

const noop = () => undefined;

// The page reads the API over HTTP; the handlers registered on the server are what answers.
const firstSiteId = psychrometricsFixtures.sites[0]?.id ?? '';
const instant = () => Promise.resolve();

const renderPage = (siteId = firstSiteId) =>
  render(
    <ApiClientProvider apiUrl={apiUrl}>
      <QueryClientProvider client={new QueryClient()}>
        <PsychrometricsPage siteId={siteId} onSiteChange={noop} />
      </QueryClientProvider>
    </ApiClientProvider>
  );

// 0.5 is neither a slow call nor a failing one.
const serveSteady = () =>
  createPsychrometricsHandlers(apiUrl, { wait: instant, random: () => 0.5 });

describe('PsychrometricsPage', () => {
  it('shows the failure, not an empty chart, when every poll fails', async () => {
    server.use(
      http.get(
        `${apiUrl}/psychrometrics/sites/:siteId/readings`,
        () => new HttpResponse(null, { status: 503 })
      ),
      ...serveSteady()
    );

    renderPage();

    expect(await screen.findByText('Cannot reach the feed')).not.toBeNull();
  });

  it('offers a replay once the feed has ended', async () => {
    server.use(
      http.get(`${apiUrl}/psychrometrics/sites/:siteId/readings`, () =>
        HttpResponse.json({ reading: null, ended: true })
      ),
      ...serveSteady()
    );

    renderPage();

    expect(await screen.findByText('Feed ended')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Replay' })).not.toBeNull();
  });

  it('lets the user pick a site when there is more than one', async () => {
    server.use(...serveSteady());

    renderPage();

    const select = await screen.findByLabelText('Site');
    expect(select.querySelectorAll('option').length).toBeGreaterThan(1);
  });

  it('plots the first reading once it arrives', async () => {
    server.use(...serveSteady());

    const { container } = renderPage();

    expect(await screen.findByText('Current reading')).not.toBeNull();
    expect(container.querySelector('[data-marker="current"]')).not.toBeNull();
  });
});
