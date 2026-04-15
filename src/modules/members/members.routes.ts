import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { MembersRouteTemplate } from "../../constants/api-path";
import { HttpStatus } from "../../constants/http-status";
import { MembershipManagementRoles } from "../../constants/membership-role";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { organizationMiddleware } from "../../middlewares/org.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { MembersService } from "./members.service";

const router = Router();
const service = new MembersService();

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role)
});

const paramsSchema = z.object({
  id: z.string().uuid()
});

/** `GET /members` — list members in the current organization. */
router.get(
  MembersRouteTemplate.List,
  authMiddleware,
  organizationMiddleware,
  asyncHandler(async (req, res) => {
    const members = await service.list(req.auth!.organizationId);
    res.status(HttpStatus.Ok).json(members);
  })
);

/** `PATCH /members/:id/role` — change a member role (OWNER/ADMIN only). */
router.patch(
  MembersRouteTemplate.RoleById,
  authMiddleware,
  organizationMiddleware,
  rbacMiddleware(MembershipManagementRoles),
  validateMiddleware({ params: paramsSchema, body: updateRoleSchema }),
  asyncHandler(async (req, res) => {
    await service.updateRole(req.auth!.organizationId, String(req.params.id), req.body.role);
    res.status(HttpStatus.NoContent).send();
  })
);

export const membersRoutes = router;
