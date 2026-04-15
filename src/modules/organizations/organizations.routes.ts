import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { organizationMiddleware } from "../../middlewares/org.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { OrganizationsService } from "./organizations.service";

const router = Router();
const service = new OrganizationsService();

/**
 * @openapi
 * /organizations/current:
 *   get:
 *     tags: [Organizations]
 *     summary: Get active organization from auth context
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current organization
 */
router.get(
  "/current",
  authMiddleware,
  organizationMiddleware,
  asyncHandler(async (req, res) => {
    const organization = await service.getCurrentOrganization(req.auth!.organizationId);
    res.status(200).json(organization);
  })
);

export const organizationRoutes = router;
