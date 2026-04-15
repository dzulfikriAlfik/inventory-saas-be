import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { HttpStatus } from "../constants/http-status";
import { I18nKey } from "../constants/i18n-key";
import { ApiError } from "../utils/api-error";

/**
 * Translates an i18n key using the request locale when available.
 *
 * @param req Request carrying `req.t` from i18next middleware.
 * @param key Translation key in namespace `common`.
 * @returns Localized string.
 */
const translate = (req: Request, key: string): string => {
  if (typeof req.t === "function") {
    return req.t(key);
  }
  return key;
};

/**
 * Central error handler: maps `ApiError` to JSON and logs unexpected failures.
 *
 * @param error Thrown value.
 * @param req Express request (for locale).
 * @param res Express response.
 * @param _next Next function (unused; required for Express error middleware signature).
 */
export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: translate(req, error.message),
      details: error.details
    });
    return;
  }

  if (error instanceof Error) {
    logger.error(error.stack ?? error.message);
  } else {
    logger.error(String(error));
  }
  res.status(HttpStatus.InternalServerError).json({
    message: translate(req, I18nKey.Errors.Internal)
  });
};
