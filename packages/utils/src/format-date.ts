const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeZone: 'UTC'
});

/**
 * Formats an ISO date string for display. Dates are rendered in UTC so a calendar date such as
 * `2026-03-01` doesn't shift a day in timezones behind UTC. Returns `fallback` for missing or
 * unparseable input rather than throwing.
 */
export const formatDate = (isoDate: string | null | undefined, fallback = '—'): string => {
  if (!isoDate) return fallback;
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
};
