import type { NextFunction, Request, Response } from "express";
import { CookieName } from "../constants/cookie-name";
import { HttpStatus } from "../constants/http-status";
import { I18nKey } from "../constants/i18n-key";
import { verifyAccessToken } from "../lib/jwt";
import { ApiError } from "../utils/api-error";

/**
 * Requires a valid access token cookie and attaches `req.auth` from JWT claims.
 *
 * @param req Incoming request (must run after `cookie-parser`).
 * @param _res Express response (unused).
 * @param next Continues to the next handler when authenticated.
 */
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const accessToken = req.cookies[CookieName.AccessToken] as string | undefined;
  if (!accessToken) {
    throw new ApiError(HttpStatus.Unauthorized, I18nKey.Errors.Auth.MissingAccessToken);
  }

  try {
    const payload = verifyAccessToken(accessToken);
    req.auth = {
      userId: payload.userId,
      organizationId: payload.organizationId,
      role: payload.role
    };
    next();
  } catch {
    throw new ApiError(HttpStatus.Unauthorized, I18nKey.Errors.Auth.InvalidAccessToken);
  }
};
