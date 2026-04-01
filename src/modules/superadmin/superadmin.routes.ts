import { Router } from "express";
import * as superadminController from "./superadmin.controller";
import { verifyToken, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.use(verifyToken, requireRole(["superadmin"]));

// Dashboard
router.get("/dashboard", superadminController.getDashboard);

// Outlet management
router.get("/outlets", superadminController.getOutlets);
router.get("/outlets/:id", superadminController.getOutletById);
router.put("/outlets/:id/status", superadminController.updateOutletStatus);

// Pencairan management
router.get("/pencairan", superadminController.getPencairanList);
router.get("/pencairan/:id", superadminController.getPencairanById);
router.put("/pencairan/:id/proses", superadminController.processPencairan);

// User management
router.get("/users", superadminController.getUsers);
router.put("/users/:id/toggle", superadminController.toggleUser);

export default router;
