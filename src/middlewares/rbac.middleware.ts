import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/http-status";
import { I18nKey } from "../constants/i18n-key";
import { ApiError } from "../utils/api-error";

/**
 * Restricts a route to one of the allowed membership roles.
 *
 * @param allowedRoles Roles that may access the handler.
 * @returns Express middleware function.
 */
export const rbacMiddleware =
  (allowedRoles: readonly Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.auth?.role;
    if (!role) {
      throw new ApiError(HttpStatus.Unauthorized, I18nKey.Errors.Auth.AuthenticationIsRequired);
    }

    if (!allowedRoles.includes(role)) {
      throw new ApiError(HttpStatus.Forbidden, I18nKey.Errors.Rbac.Forbidden);
    }

    next();
  };
