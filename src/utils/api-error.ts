/**
 * Application-level HTTP error with an i18n message key and optional validation details.
 *
 * The `message` field stores a translation key resolved via `req.t` in the error middleware
 * (namespace `common`, see `src/constants/i18n-key.ts` and locale JSON files).
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  /**
   * @param statusCode HTTP status to return.
   * @param message i18n key (for example `I18nKey.Errors.Auth.MissingAccessToken`).
   * @param details Optional structured validation or debug payload.
   */
  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
