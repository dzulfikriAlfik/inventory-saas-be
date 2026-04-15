/**
 * Winston daily-rotate-file naming and retention.
 */
export const LogRotation = {
  /** Filename pattern; `%DATE%` is replaced with the day (YYYY-MM-DD). */
  DailyFilePattern: "app-%DATE%.log",
  /** Day granularity for log files. */
  DatePattern: "YYYY-MM-DD"
} as const;
