import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { HttpStatus } from "../constants/http-status";
import { I18nKey } from "../constants/i18n-key";
import { ApiError } from "../utils/api-error";

type ValidationSchema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

/**
 * Validates `body`, `params`, or `query` with Zod and forwards `flatten()` details on failure.
 *
 * @param schema - Which request parts to validate; omit parts that are not used.
 * @param schema.body - Optional Zod schema for `req.body` (after `express.json()`).
 * @param schema.params - Optional Zod schema for `req.params` (route placeholders).
 * @param schema.query - Optional Zod schema for `req.query` (query string).
 * @returns Express middleware that runs validation then `next()` or throws `ApiError` (`400`).
 */
export const validateMiddleware =
  (schema: ValidationSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const bodyResult = schema.body?.safeParse(req.body);
    if (bodyResult && !bodyResult.success) {
      throw new ApiError(HttpStatus.BadRequest, I18nKey.Errors.Validation.InvalidBody, bodyResult.error.flatten());
    }

    const paramsResult = schema.params?.safeParse(req.params);
    if (paramsResult && !paramsResult.success) {
      throw new ApiError(
        HttpStatus.BadRequest,
        I18nKey.Errors.Validation.InvalidParams,
        paramsResult.error.flatten()
      );
    }

    const queryResult = schema.query?.safeParse(req.query);
    if (queryResult && !queryResult.success) {
      throw new ApiError(
        HttpStatus.BadRequest,
        I18nKey.Errors.Validation.InvalidQuery,
        queryResult.error.flatten()
      );
    }

    next();
  };
