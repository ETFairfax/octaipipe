import { fireEvent, render, screen } from '@testing-library/react';
import { CookieBanner } from '@workspace/ui/components/cookie-banner';
import { CONSENT_STORAGE_KEY, type ConsentRecord } from '@workspace/ui/hooks/use-cookie-consent';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function readStoredRecord(): ConsentRecord | null {
  const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
  return raw === null ? null : (JSON.parse(raw) as ConsentRecord);
}

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens with Necessary locked on and Other Cookies defaulted on when there is no stored consent', () => {
    render(<CookieBanner />);

    expect(screen.getByText('Cookie preferences')).not.toBeNull();

    const necessarySwitch = screen.getByRole('switch', { name: 'Necessary Cookies (always on)' });
    expect(necessarySwitch.getAttribute('aria-checked')).toBe('true');
    expect(necessarySwitch.getAttribute('aria-disabled')).toBe('true');

    const analyticsSwitch = screen.getByRole('switch', { name: 'Analytics' });
    expect(analyticsSwitch.getAttribute('aria-checked')).toBe('true');
  });

  it('is not dismissed by pressing Escape', () => {
    render(<CookieBanner />);

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(screen.getByText('Cookie preferences')).not.toBeNull();
  });

  it('persists the current toggle state and closes when Accept is clicked', () => {
    render(<CookieBanner />);

    fireEvent.click(screen.getByRole('switch', { name: 'Analytics' }));
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    const record = readStoredRecord();
    expect(record?.choices.analytics).toBe(false);
    expect(screen.queryByText('Cookie preferences')).toBeNull();
  });

  it('reopens and resets a previously-off choice when consent has expired', () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        consentedAt: new Date(Date.now() - 2000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        choices: { analytics: false }
      } satisfies ConsentRecord)
    );

    render(<CookieBanner />);

    expect(screen.getByText('Cookie preferences')).not.toBeNull();
    expect(screen.getByRole('switch', { name: 'Analytics' }).getAttribute('aria-checked')).toBe(
      'true'
    );
  });

  it('stays closed when a valid, unexpired record already covers every cookie', () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        consentedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        choices: { analytics: false }
      } satisfies ConsentRecord)
    );

    render(<CookieBanner />);

    expect(screen.queryByText('Cookie preferences')).toBeNull();
  });

  it('reopens when the cookie list has an id the stored record has no choice for', () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        consentedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        choices: {}
      } satisfies ConsentRecord)
    );

    render(<CookieBanner />);

    expect(screen.getByText('Cookie preferences')).not.toBeNull();
    expect(screen.getByRole('switch', { name: 'Analytics' }).getAttribute('aria-checked')).toBe(
      'true'
    );
  });
});
