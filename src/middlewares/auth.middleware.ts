import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { ApiError } from "../utils/api-error";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const accessToken = req.cookies.accessToken as string | undefined;
  if (!accessToken) {
    throw new ApiError(401, "errors.auth.missingAccessToken");
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
    throw new ApiError(401, "errors.auth.invalidAccessToken");
  }
};
