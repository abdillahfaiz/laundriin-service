import { Router } from "express";
import * as outletController from "./outlet.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";
import { validateQuery } from "../../../middlewares/validate.middleware";
import { nearbyOutletQuerySchema, checkCoverageSchema } from "./outlet.schema";

const router = Router();

router.use(verifyToken, requireRole(["customer"]));

router.get("/nearby", validateQuery(nearbyOutletQuerySchema), outletController.getNearbyOutlets);
router.get("/:id", outletController.getOutletById);

// Coverage
router.get("/:id/coverage", validateQuery(checkCoverageSchema), outletController.getCoverage);

// Parfum
router.get("/:id/parfum", outletController.getParfumByOutlet);

// Layanan Per KG
router.get("/:id/layanan/per-kg", outletController.getLayananPerKg);
router.get("/:id/layanan/per-kg/:jenisId/durasi", outletController.getDurasiPerKg);

// Layanan Per Item
router.get("/:id/layanan/per-item/items", outletController.getItemsPerItem);
router.get("/:id/layanan/per-item/items/:itemId/jenis", outletController.getJenisPerItem);
router.get("/:id/layanan/per-item/jenis/:jenisId/durasi", outletController.getDurasiPerItem);

export default router;
