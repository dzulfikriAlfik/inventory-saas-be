import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

export const organizationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.auth?.organizationId) {
    throw new ApiError(403, "Organization context is required");
  }

  next();
};
