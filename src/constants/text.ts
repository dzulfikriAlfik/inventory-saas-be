/**
 * Reusable string patterns for normalization.
 */
export const TextPattern = {
  /** Collapses consecutive whitespace for slug generation. */
  WhitespaceRuns: /\s+/g
} as const;

/**
 * Separator inserted between slug tokens.
 */
export const SlugSeparator = "-";
