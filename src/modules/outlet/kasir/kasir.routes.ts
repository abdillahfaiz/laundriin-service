import { Router } from "express";
import * as kasirController from "./kasir.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { createKasirSchema, updateKasirSchema } from "./kasir.schema";

const router = Router();

router.use(verifyToken, requireRole(["admin_outlet"]));

router.get("/", kasirController.getKasirList);
router.post("/", validateBody(createKasirSchema), kasirController.createKasir);
router.put("/:id", validateBody(updateKasirSchema), kasirController.updateKasir);
router.put("/:id/toggle", kasirController.toggleKasir);

export default router;
