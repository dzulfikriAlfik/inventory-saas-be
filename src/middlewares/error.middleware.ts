import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { ApiError } from "../utils/api-error";

const translate = (req: Request, key: string): string => {
  if (typeof req.t === "function") {
    return req.t(key);
  }
  return key;
};

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
  res.status(500).json({
    message: translate(req, "errors.internal")
  });
};
