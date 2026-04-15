import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { membersRoutes } from "../modules/members/members.routes";
import { organizationRoutes } from "../modules/organizations/organizations.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/members", membersRoutes);

export const apiRoutes = router;
