import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/http-status";
import { I18nKey } from "../constants/i18n-key";
import { ApiError } from "../utils/api-error";

/**
 * Ensures JWT carried an organization id (tenant context for MVP single-org users).
 *
 * @param req Request with `req.auth` populated by {@link authMiddleware}.
 * @param _res Express response (unused).
 * @param next Continues when organization context exists.
 */
export const organizationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.auth?.organizationId) {
    throw new ApiError(HttpStatus.Forbidden, I18nKey.Errors.Organization.ContextRequired);
  }

  next();
};
