import crypto from "node:crypto";
import type { Role } from "@prisma/client";
import jwt, { type SignOptions } from "jsonwebtoken";
import { CryptoAlgorithm } from "../constants/crypto";
import { env } from "../config/env";

/**
 * JWT payload shared by access and refresh tokens (MVP: one org per user).
 */
export type JwtPayload = {
  userId: string;
  organizationId: string;
  role: Role;
};

/**
 * Creates a signed access token.
 *
 * @param payload Claims stored in the token.
 * @returns Serialized JWT string.
 */
export const signAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_TTL as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

/**
 * Creates a signed refresh token.
 *
 * @param payload Claims stored in the token.
 * @returns Serialized JWT string.
 */
export const signRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_TTL as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

/**
 * Verifies an access token using the access secret.
 *
 * @param token Raw JWT from the cookie.
 * @returns Decoded payload.
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
};

/**
 * Verifies a refresh token using the refresh secret.
 *
 * @param token Raw JWT from the cookie or body.
 * @returns Decoded payload.
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

/**
 * Produces a deterministic hash for persisting refresh tokens (never store raw tokens).
 *
 * @param token Raw refresh JWT.
 * @returns Hex-encoded SHA-256 digest.
 */
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash(CryptoAlgorithm.Sha256).update(token).digest("hex");
};
