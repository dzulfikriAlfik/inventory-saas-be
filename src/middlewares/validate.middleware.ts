import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/api-error";

type ValidationSchema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const validateMiddleware =
  (schema: ValidationSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const bodyResult = schema.body?.safeParse(req.body);
    if (bodyResult && !bodyResult.success) {
      throw new ApiError(400, "Invalid request body", bodyResult.error.flatten());
    }

    const paramsResult = schema.params?.safeParse(req.params);
    if (paramsResult && !paramsResult.success) {
      throw new ApiError(400, "Invalid request params", paramsResult.error.flatten());
    }

    const queryResult = schema.query?.safeParse(req.query);
    if (queryResult && !queryResult.success) {
      throw new ApiError(400, "Invalid request query", queryResult.error.flatten());
    }

    next();
  };
