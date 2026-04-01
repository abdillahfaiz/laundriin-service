import { Router } from "express";
import * as layananController from "./layanan.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import {
  jenisLayananSchema,
  durasiLayananSchema,
  itemLayananSchema,
  parfumSchema,
  jenisPerItemSchema,
  durasiPerItemSchema,
} from "./layanan.schema";

const router = Router();

router.use(verifyToken, requireRole(["admin_outlet"]));

// ==================== PER KG ====================
// Jenis Layanan (Per KG)
router.get("/per-kg/jenis", layananController.getJenisLayanan);
router.post("/per-kg/jenis", validateBody(jenisLayananSchema), layananController.createJenisLayanan);
router.put("/per-kg/jenis/:id", validateBody(jenisLayananSchema), layananController.updateJenisLayanan);
router.put("/per-kg/jenis/:id/toggle", layananController.toggleJenisLayanan);
router.delete("/per-kg/jenis/:id", layananController.deleteJenisLayanan);

// Durasi Layanan (Per KG) — nested under jenis
router.get("/per-kg/jenis/:id/durasi", layananController.getDurasiLayanan);
router.post("/per-kg/jenis/:id/durasi", validateBody(durasiLayananSchema), layananController.createDurasiLayanan);
router.put("/per-kg/durasi/:id", validateBody(durasiLayananSchema), layananController.updateDurasiLayanan);
router.put("/per-kg/durasi/:id/toggle", layananController.toggleDurasiLayanan);
router.delete("/per-kg/durasi/:id", layananController.deleteDurasiLayanan);

// ==================== PER ITEM ====================
// Item Layanan
router.get("/per-item/items", layananController.getItemLayanan);
router.post("/per-item/items", validateBody(itemLayananSchema), layananController.createItemLayanan);
router.put("/per-item/items/:id", validateBody(itemLayananSchema), layananController.updateItemLayanan);
router.put("/per-item/items/:id/toggle", layananController.toggleItemLayanan);
router.delete("/per-item/items/:id", layananController.deleteItemLayanan);

// Jenis Per Item
router.get("/per-item/items/:id/jenis", layananController.getJenisPerItem);
router.post("/per-item/items/:id/jenis", validateBody(jenisPerItemSchema), layananController.createJenisPerItem);
router.put("/per-item/jenis/:id", validateBody(jenisPerItemSchema), layananController.updateJenisPerItem);
router.put("/per-item/jenis/:id/toggle", layananController.toggleJenisPerItem);
router.delete("/per-item/jenis/:id", layananController.deleteJenisPerItem);

// Durasi Per Item
router.get("/per-item/jenis/:id/durasi", layananController.getDurasiPerItem);
router.post("/per-item/jenis/:id/durasi", validateBody(durasiPerItemSchema), layananController.createDurasiPerItem);
router.put("/per-item/durasi/:id", validateBody(durasiPerItemSchema), layananController.updateDurasiPerItem);
router.put("/per-item/durasi/:id/toggle", layananController.toggleDurasiPerItem);
router.delete("/per-item/durasi/:id", layananController.deleteDurasiPerItem);

// ==================== PARFUM ====================
router.get("/parfum", layananController.getParfum);
router.post("/parfum", validateBody(parfumSchema), layananController.createParfum);
router.put("/parfum/:id", validateBody(parfumSchema), layananController.updateParfum);
router.put("/parfum/:id/toggle", layananController.toggleParfum);
router.delete("/parfum/:id", layananController.deleteParfum);

export default router;
