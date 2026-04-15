import { type Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { organizationMiddleware } from "../../middlewares/org.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { MembersService } from "./members.service";

const router = Router();
const service = new MembersService();

const updateRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "STAFF"])
});

const paramsSchema = z.object({
  id: z.string().uuid()
});

/**
 * @openapi
 * /members:
 *   get:
 *     tags: [Members]
 *     summary: List members in current organization
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Members list
 */
router.get(
  "/",
  authMiddleware,
  organizationMiddleware,
  asyncHandler(async (req, res) => {
    const members = await service.list(req.auth!.organizationId);
    res.status(200).json(members);
  })
);

/**
 * @openapi
 * /members/{id}/role:
 *   patch:
 *     tags: [Members]
 *     summary: Update membership role
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: Role updated
 */
router.patch(
  "/:id/role",
  authMiddleware,
  organizationMiddleware,
  rbacMiddleware(["OWNER", "ADMIN"] as Role[]),
  validateMiddleware({ params: paramsSchema, body: updateRoleSchema }),
  asyncHandler(async (req, res) => {
    await service.updateRole(req.auth!.organizationId, String(req.params.id), req.body.role);
    res.status(204).send();
  })
);

export const membersRoutes = router;
