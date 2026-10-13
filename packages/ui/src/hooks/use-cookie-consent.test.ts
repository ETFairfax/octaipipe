import { act, renderHook } from '@testing-library/react';
import {
  CONSENT_STORAGE_KEY,
  type ConsentRecord,
  useCookieConsent
} from '@workspace/ui/hooks/use-cookie-consent';
import { beforeEach, describe, expect, it } from 'vitest';

function dispatchStorageEvent(newValue: string | null): void {
  act(() => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: CONSENT_STORAGE_KEY,
        newValue,
        storageArea: localStorage
      })
    );
  });
}

describe('useCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('closes the banner and adopts the new choices when another tab writes a consent record', () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.choices.analytics).toBe(true);

    const otherTabRecord: ConsentRecord = {
      consentedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      choices: { analytics: false }
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(otherTabRecord));
    dispatchStorageEvent(JSON.stringify(otherTabRecord));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.choices.analytics).toBe(false);
  });

  it('reopens the banner and resets choices when another tab clears the consent record', () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        consentedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        choices: { analytics: false }
      } satisfies ConsentRecord)
    );

    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.choices.analytics).toBe(false);

    localStorage.removeItem(CONSENT_STORAGE_KEY);
    dispatchStorageEvent(null);

    expect(result.current.isOpen).toBe(true);
    expect(result.current.choices.analytics).toBe(true);
  });

  it('ignores storage events for unrelated keys', () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.isOpen).toBe(true);

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'some-other-key',
          newValue: 'irrelevant',
          storageArea: localStorage
        })
      );
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.choices.analytics).toBe(true);
  });
});
