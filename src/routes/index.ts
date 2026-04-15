import { Router } from "express";
import { ApiMount, ApiSegment } from "../constants/api-path";
import { HealthStatus } from "../constants/health";
import { HttpStatus } from "../constants/http-status";
import { authRoutes } from "../modules/auth/auth.routes";
import { membersRoutes } from "../modules/members/members.routes";
import { organizationRoutes } from "../modules/organizations/organizations.routes";

const router = Router();

/** Liveness probe for load balancers and local checks. */
router.get(`/${ApiSegment.Health}`, (_req, res) => {
  res.status(HttpStatus.Ok).json({ status: HealthStatus.Ok });
});

router.use(`/${ApiMount.Auth}`, authRoutes);
router.use(`/${ApiMount.Organizations}`, organizationRoutes);
router.use(`/${ApiMount.Members}`, membersRoutes);

export const apiRoutes = router;
