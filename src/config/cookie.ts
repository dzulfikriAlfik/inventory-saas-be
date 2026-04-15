import type { CookieOptions } from "express";
import { CookiePath } from "../constants/cookie-option";
import { TimeMs } from "../constants/time-ms";
import { env } from "./env";

type SameSite = "lax" | "strict" | "none";

/**
 * Base options shared by auth cookies (HttpOnly; secure flag from env).
 */
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE as SameSite,
  domain: env.COOKIE_DOMAIN || undefined,
  path: CookiePath.Root
};

/**
 * Options for the short-lived access token cookie.
 */
export const accessCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: TimeMs.OneDay
};

/**
 * Options for the refresh token cookie.
 */
export const refreshCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: TimeMs.OneWeek
};
