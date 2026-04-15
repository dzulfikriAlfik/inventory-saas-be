import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { AuthController } from "./auth.controller";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema";

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a user and organization
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post(
  "/register",
  validateMiddleware({ body: registerSchema }),
  asyncHandler((req, res) => controller.register(req, res))
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login using email and password
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
  "/login",
  validateMiddleware({ body: loginSchema }),
  asyncHandler((req, res) => controller.login(req, res))
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post(
  "/refresh",
  validateMiddleware({ body: refreshSchema }),
  asyncHandler((req, res) => controller.refresh(req, res))
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current session
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", asyncHandler((req, res) => controller.logout(req, res)));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user context
 */
router.get("/me", authMiddleware, asyncHandler((req, res) => controller.me(req, res)));

export const authRoutes = router;
