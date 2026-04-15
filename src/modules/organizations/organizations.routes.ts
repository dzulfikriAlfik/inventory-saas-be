import { Router } from "express";
import { OrganizationRouteTemplate } from "../../constants/api-path";
import { HttpStatus } from "../../constants/http-status";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { organizationMiddleware } from "../../middlewares/org.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { OrganizationsService } from "./organizations.service";

const router = Router();
const service = new OrganizationsService();

/** `GET /organizations/current` — resolve organization from JWT context. */
router.get(
  OrganizationRouteTemplate.Current,
  authMiddleware,
  organizationMiddleware,
  asyncHandler(async (req, res) => {
    const organization = await service.getCurrentOrganization(req.auth!.organizationId);
    res.status(HttpStatus.Ok).json(organization);
  })
);

export const organizationRoutes = router;
