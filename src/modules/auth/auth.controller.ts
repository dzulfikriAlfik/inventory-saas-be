import type { Request, Response } from "express";
import { accessCookieOptions, refreshCookieOptions } from "../../config/cookie";
import { AuthBodyField } from "../../constants/auth-body-field";
import { CookieName } from "../../constants/cookie-name";
import { HttpStatus } from "../../constants/http-status";
import { I18nKey } from "../../constants/i18n-key";
import { ApiError } from "../../utils/api-error";
import { AuthService } from "./auth.service";

const authService = new AuthService();

/**
 * HTTP handlers for authentication and session cookies.
 */
export class AuthController {
  /**
   * Registers a tenant (user + organization) and sets access and refresh cookies.
   *
   * @param req - Express request after `express.json()` and `validateMiddleware({ body: registerSchema })`.
   * @param req.body - Validated registration payload (`RegisterInput` in `auth.schema.ts`).
   * @param req.body.email - Email for the new user (must not already exist).
   * @param req.body.password - Plaintext password (hashed before storage).
   * @param req.body.fullName - User display name.
   * @param req.body.organizationName - New organization (tenant) display name.
   * @param req.t - i18n function (sets JSON `message` from `I18nKey.Messages.Auth.Registered`).
   * @param res - Response used to `cookie()`, `status`, and `json`.
   * @returns Promise that completes after the HTTP response is sent.
   */
  async register(req: Request, res: Response): Promise<void> {
    const tokens = await authService.register(req.body);
    res.cookie(CookieName.AccessToken, tokens.accessToken, accessCookieOptions);
    res.cookie(CookieName.RefreshToken, tokens.refreshToken, refreshCookieOptions);
    res.status(HttpStatus.Created).json({ message: req.t(I18nKey.Messages.Auth.Registered) });
  }

  /**
   * Validates credentials and sets access and refresh cookies.
   *
   * @param req - Express request after body validation with `loginSchema`.
   * @param req.body - Validated login payload (`LoginInput` in `auth.schema.ts`).
   * @param req.body.email - Registered user email.
   * @param req.body.password - Plaintext password to verify.
   * @param req.t - i18n function for success `message`.
   * @param res - Response used to set cookies and JSON body.
   * @returns Promise that completes after the HTTP response is sent.
   */
  async login(req: Request, res: Response): Promise<void> {
    const tokens = await authService.login(req.body);
    res.cookie(CookieName.AccessToken, tokens.accessToken, accessCookieOptions);
    res.cookie(CookieName.RefreshToken, tokens.refreshToken, refreshCookieOptions);
    res.status(HttpStatus.Ok).json({ message: req.t(I18nKey.Messages.Auth.LoginSuccess) });
  }

  /**
   * Exchanges a refresh token for a new access/refresh pair (rotation).
   *
   * @param req - Express request; refresh token may appear in cookies or body.
   * @param req.cookies - Must include `CookieName.RefreshToken` when using cookie-only flow.
   * @param req.cookies[CookieName.RefreshToken] - Optional refresh JWT cookie.
   * @param req.body - Optional body with `AuthBodyField.RefreshToken` when not using cookies.
   * @param req.body[AuthBodyField.RefreshToken] - Optional refresh JWT in JSON body.
   * @param req.t - i18n function for success `message`.
   * @param res - Response used to set cookies and JSON body.
   * @returns Promise that completes after the HTTP response is sent.
   * @throws {ApiError} When neither cookie nor body supplies a refresh token (`400`).
   */
  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken =
      (req.cookies[CookieName.RefreshToken] as string | undefined) ??
      (req.body[AuthBodyField.RefreshToken] as string | undefined);
    if (!refreshToken) {
      throw new ApiError(HttpStatus.BadRequest, I18nKey.Errors.Auth.MissingRefreshToken);
    }

    const tokens = await authService.refresh(refreshToken);
    res.cookie(CookieName.AccessToken, tokens.accessToken, accessCookieOptions);
    res.cookie(CookieName.RefreshToken, tokens.refreshToken, refreshCookieOptions);
    res.status(HttpStatus.Ok).json({ message: req.t(I18nKey.Messages.Auth.TokenRefreshed) });
  }

  /**
   * Revokes the refresh session (best-effort) and clears auth cookies.
   *
   * @param req - Express request after `cookie-parser`.
   * @param req.cookies[CookieName.RefreshToken] - Optional; when present, session is revoked in the database.
   * @param req.t - i18n function for success `message`.
   * @param res - Response used to `clearCookie` and `json`.
   * @returns Promise that completes after the HTTP response is sent.
   */
  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[CookieName.RefreshToken] as string | undefined;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie(CookieName.AccessToken, accessCookieOptions);
    res.clearCookie(CookieName.RefreshToken, refreshCookieOptions);
    res.status(HttpStatus.Ok).json({ message: req.t(I18nKey.Messages.Auth.LogoutSuccess) });
  }

  /**
   * Returns the current user and organization (requires prior `authMiddleware`).
   *
   * @param req - Express request after `authMiddleware` and optional `organizationMiddleware`.
   * @param req.auth - Set by `authMiddleware`; must exist for this handler.
   * @param req.auth.userId - User id from the access JWT.
   * @param req.auth.organizationId - Tenant id from the access JWT.
   * @param req.auth.role - Role from the access JWT (OWNER, ADMIN, or STAFF).
   * @param res - Response used to send JSON `user` and `organization` objects.
   * @returns Promise that completes after the HTTP response is sent.
   * @throws {ApiError} When `req.auth` is missing (`401`).
   */
  async me(req: Request, res: Response): Promise<void> {
    if (!req.auth) {
      throw new ApiError(HttpStatus.Unauthorized, I18nKey.Errors.Auth.AuthenticationRequired);
    }

    const data = await authService.me(req.auth.userId, req.auth.organizationId);
    res.status(HttpStatus.Ok).json(data);
  }
}
