import { Router } from "express";
import { AuthRouteTemplate } from "../../constants/api-path";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { AuthController } from "./auth.controller";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema";

const router = Router();
const controller = new AuthController();

/** `POST /auth/register` — create user, organization, and OWNER membership. */
router.post(
  AuthRouteTemplate.Register,
  validateMiddleware({ body: registerSchema }),
  asyncHandler((req, res) => controller.register(req, res))
);

/** `POST /auth/login` — issue session cookies. */
router.post(
  AuthRouteTemplate.Login,
  validateMiddleware({ body: loginSchema }),
  asyncHandler((req, res) => controller.login(req, res))
);

/** `POST /auth/refresh` — rotate refresh session. */
router.post(
  AuthRouteTemplate.Refresh,
  validateMiddleware({ body: refreshSchema }),
  asyncHandler((req, res) => controller.refresh(req, res))
);

/** `POST /auth/logout` — revoke refresh session and clear cookies. */
router.post(AuthRouteTemplate.Logout, asyncHandler((req, res) => controller.logout(req, res)));

/** `GET /auth/me` — current user + organization (requires access cookie). */
router.get(AuthRouteTemplate.Me, authMiddleware, asyncHandler((req, res) => controller.me(req, res)));

export const authRoutes = router;
