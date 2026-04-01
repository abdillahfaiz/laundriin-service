import { Router } from "express";
import * as profileController from "./profile.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { coverageSchema } from "./profile.schema";

const router = Router();

router.use(verifyToken, requireRole(["admin_outlet"]));

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.get("/operasional", profileController.getOperasional);
router.put("/operasional", profileController.updateOperasional);

// Coverage Area
router.get("/coverage", profileController.getCoverages);
router.post("/coverage", validateBody(coverageSchema), profileController.createCoverage);
router.put("/coverage/:id", validateBody(coverageSchema), profileController.updateCoverage);
router.delete("/coverage/:id", profileController.deleteCoverage);

export default router;
