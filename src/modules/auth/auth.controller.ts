import type { Request, Response } from "express";
import { accessCookieOptions, refreshCookieOptions } from "../../config/cookie";
import { ApiError } from "../../utils/api-error";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const tokens = await authService.register(req.body);
    res.cookie("accessToken", tokens.accessToken, accessCookieOptions);
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions);
    res.status(201).json({ message: req.t("messages.auth.registered") });
  }

  async login(req: Request, res: Response): Promise<void> {
    const tokens = await authService.login(req.body);
    res.cookie("accessToken", tokens.accessToken, accessCookieOptions);
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions);
    res.status(200).json({ message: req.t("messages.auth.loginSuccess") });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = (req.cookies.refreshToken as string | undefined) ?? req.body.refreshToken;
    if (!refreshToken) {
      throw new ApiError(400, "errors.auth.missingRefreshToken");
    }

    const tokens = await authService.refresh(refreshToken);
    res.cookie("accessToken", tokens.accessToken, accessCookieOptions);
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions);
    res.status(200).json({ message: req.t("messages.auth.tokenRefreshed") });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie("accessToken", accessCookieOptions);
    res.clearCookie("refreshToken", refreshCookieOptions);
    res.status(200).json({ message: req.t("messages.auth.logoutSuccess") });
  }

  async me(req: Request, res: Response): Promise<void> {
    if (!req.auth) {
      throw new ApiError(401, "errors.auth.authenticationRequired");
    }

    const data = await authService.me(req.auth.userId, req.auth.organizationId);
    res.status(200).json(data);
  }
}
