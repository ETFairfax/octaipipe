import { COOKIE_LIST, type OtherCookie } from '@workspace/ui/lib/cookie-list';
import * as React from 'react';

type ConsentRecord = {
  consentedAt: string;
  expiresAt: string;
  choices: Record<string, boolean>;
};

const CONSENT_STORAGE_KEY = 'cookie-consent';
const CONSENT_DURATION_MONTHS = 6;

function isConsentRecord(value: unknown): value is ConsentRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.consentedAt === 'string' &&
    typeof record.expiresAt === 'string' &&
    typeof record.choices === 'object' &&
    record.choices !== null
  );
}

function readConsentRecord(): ConsentRecord | null {
  const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return isConsentRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeConsentRecord(record: ConsentRecord): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
}

function isConsentExpired(record: ConsentRecord, now: Date = new Date()): boolean {
  return now.getTime() > new Date(record.expiresAt).getTime();
}

function shouldShowBanner(record: ConsentRecord | null, cookieList: OtherCookie[]): boolean {
  if (record === null) {
    return true;
  }

  if (isConsentExpired(record)) {
    return true;
  }

  return cookieList.some(cookie => !(cookie.id in record.choices));
}

function computeInitialChoices(
  record: ConsentRecord | null,
  cookieList: OtherCookie[]
): Record<string, boolean> {
  const isStale = record === null || isConsentExpired(record);

  const choices: Record<string, boolean> = {};
  for (const cookie of cookieList) {
    choices[cookie.id] = !isStale && record !== null ? (record.choices[cookie.id] ?? true) : true;
  }

  return choices;
}

function buildConsentRecord(
  choices: Record<string, boolean>,
  now: Date = new Date()
): ConsentRecord {
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + CONSENT_DURATION_MONTHS);

  return {
    consentedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    choices
  };
}

type ConsentState = {
  record: ConsentRecord | null;
  isOpen: boolean;
  choices: Record<string, boolean>;
};

function deriveConsentState(record: ConsentRecord | null, cookieList: OtherCookie[]): ConsentState {
  return {
    record,
    isOpen: shouldShowBanner(record, cookieList),
    choices: computeInitialChoices(record, cookieList)
  };
}

function useCookieConsent() {
  const [state, setState] = React.useState<ConsentState>(() =>
    deriveConsentState(readConsentRecord(), COOKIE_LIST)
  );

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || event.key !== CONSENT_STORAGE_KEY) {
        return;
      }

      setState(deriveConsentState(readConsentRecord(), COOKIE_LIST));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setChoice = React.useCallback((id: string, value: boolean) => {
    setState(prev => ({ ...prev, choices: { ...prev.choices, [id]: value } }));
  }, []);

  const accept = React.useCallback(() => {
    setState(prev => {
      const nextRecord = buildConsentRecord(prev.choices);
      writeConsentRecord(nextRecord);
      return { ...prev, record: nextRecord, isOpen: false };
    });
  }, []);

  return {
    isOpen: state.isOpen,
    otherCookies: COOKIE_LIST,
    choices: state.choices,
    setChoice,
    accept
  };
}

export type { ConsentRecord };
export { CONSENT_STORAGE_KEY, useCookieConsent };
