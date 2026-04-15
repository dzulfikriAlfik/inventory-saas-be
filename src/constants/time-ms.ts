/**
 * Common time intervals in milliseconds for TTLs and cookie max-age.
 */
export const TimeMs = {
  /** One calendar day (24 hours). */
  OneDay: 24 * 60 * 60 * 1000,
  /** Seven days (refresh token window). */
  OneWeek: 7 * 24 * 60 * 60 * 1000
} as const;
