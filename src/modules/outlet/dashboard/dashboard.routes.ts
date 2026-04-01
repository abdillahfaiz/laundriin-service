import { Router } from "express";
import * as dashboardController from "./dashboard.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";

const router = Router();

router.use(verifyToken, requireRole(["admin_outlet", "kasir"]));

router.get("/", dashboardController.getDashboard);

export default router;
