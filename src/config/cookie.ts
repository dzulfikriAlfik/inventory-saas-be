import type { CookieOptions } from "express";
import { env } from "./env";

type SameSite = "lax" | "strict" | "none";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE as SameSite,
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/"
};

export const accessCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 24 * 60 * 60 * 1000
};

export const refreshCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000
};
