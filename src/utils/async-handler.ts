import type { NextFunction, Request, Response } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps an async Express handler so rejections are forwarded to `next(error)`.
 *
 * @param handler Async route or middleware function.
 * @returns A synchronous Express-compatible handler.
 */
export const asyncHandler =
  (handler: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    void handler(req, res, next).catch(next);
  };
