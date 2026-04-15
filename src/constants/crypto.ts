/**
 * Cryptographic algorithms used for non-password hashing.
 */
export const CryptoAlgorithm = {
  /** Used to hash refresh tokens before persisting them. */
  Sha256: "sha256"
} as const;
