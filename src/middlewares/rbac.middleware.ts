import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

export const rbacMiddleware =
  (allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.auth?.role;
    if (!role) {
      throw new ApiError(401, "Authentication is required");
    }

    if (!allowedRoles.includes(role)) {
      throw new ApiError(403, "Forbidden");
    }

    next();
  };
