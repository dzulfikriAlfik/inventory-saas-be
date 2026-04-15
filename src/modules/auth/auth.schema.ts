import { z } from "zod";
import { AuthBodyField } from "../../constants/auth-body-field";

/**
 * Zod schemas for auth route bodies. Inferred types: {@link RegisterInput}, {@link LoginInput}.
 */

/**
 * Body for `POST /auth/register`.
 *
 * Fields:
 * - `email` — user login email (must be unique in the system).
 * - `password` — plaintext password; minimum 8 characters before hashing.
 * - `fullName` — display name for the user profile.
 * - `organizationName` — new tenant name; a URL slug is derived from it in the service layer.
 */
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  organizationName: z.string().min(2)
});

/**
 * Body for `POST /auth/login`.
 *
 * Fields:
 * - `email` — registered user email.
 * - `password` — plaintext password to verify against the stored hash.
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

/**
 * Body for `POST /auth/refresh` when the refresh token is not sent via cookie.
 *
 * Fields:
 * - `[AuthBodyField.RefreshToken]` — optional raw refresh JWT (cookie is preferred when present).
 */
export const refreshSchema = z.object({
  [AuthBodyField.RefreshToken]: z.string().optional()
});

/** Inferred type of `registerSchema` (registration body). */
export type RegisterInput = z.infer<typeof registerSchema>;

/** Inferred type of `loginSchema` (login body). */
export type LoginInput = z.infer<typeof loginSchema>;
