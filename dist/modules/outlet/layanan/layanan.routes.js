"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const layananController = __importStar(require("./layanan.controller"));
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const layanan_schema_1 = require("./layanan.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["admin_outlet"]));
// ==================== PER KG ====================
// Jenis Layanan (Per KG)
router.get("/per-kg/jenis", layananController.getJenisLayanan);
router.post("/per-kg/jenis", (0, validate_middleware_1.validateBody)(layanan_schema_1.jenisLayananSchema), layananController.createJenisLayanan);
router.put("/per-kg/jenis/:id", (0, validate_middleware_1.validateBody)(layanan_schema_1.jenisLayananSchema), layananController.updateJenisLayanan);
router.delete("/per-kg/jenis/:id", layananController.deleteJenisLayanan);
// Durasi Layanan (Per KG)
router.get("/per-kg/jenis/:id/durasi", layananController.getDurasiLayanan);
router.post("/per-kg/jenis/:id/durasi", (0, validate_middleware_1.validateBody)(layanan_schema_1.durasiLayananSchema), layananController.createDurasiLayanan);
router.put("/per-kg/durasi/:id", (0, validate_middleware_1.validateBody)(layanan_schema_1.durasiLayananSchema), layananController.updateDurasiLayanan);
router.delete("/per-kg/durasi/:id", layananController.deleteDurasiLayanan);
// ==================== PER ITEM ====================
// Item Layanan
router.get("/per-item/items", layananController.getItemLayanan);
router.post("/per-item/items", (0, validate_middleware_1.validateBody)(layanan_schema_1.itemLayananSchema), layananController.createItemLayanan);
router.put("/per-item/items/:id", (0, validate_middleware_1.validateBody)(layanan_schema_1.itemLayananSchema), layananController.updateItemLayanan);
router.delete("/per-item/items/:id", layananController.deleteItemLayanan);
// Jenis Per Item
router.get("/per-item/items/:id/jenis", layananController.getJenisPerItem);
router.post("/per-item/items/:id/jenis", (0, validate_middleware_1.validateBody)(layanan_schema_1.jenisPerItemSchema), layananController.createJenisPerItem);
router.put("/per-item/jenis/:id", (0, validate_middleware_1.validateBody)(layanan_schema_1.jenisPerItemSchema), layananController.updateJenisPerItem);
router.put("/per-item/jenis/:id/toggle", layananController.toggleJenisPerItem);
router.delete("/per-item/jenis/:id", layananController.deleteJenisPerItem);
// Durasi Per Item
router.get("/per-item/jenis/:id/durasi", layananController.getDurasiPerItem);
router.post("/per-item/jenis/:id/durasi", (0, validate_middleware_1.validateBody)(layanan_schema_1.durasiPerItemSchema), layananController.createDurasiPerItem);
router.put("/per-item/durasi/:id", (0, validate_middleware_1.validateBody)(layanan_schema_1.durasiPerItemSchema), layananController.updateDurasiPerItem);
router.put("/per-item/durasi/:id/toggle", layananController.toggleDurasiPerItem);
router.delete("/per-item/durasi/:id", layananController.deleteDurasiPerItem);
// Parfum
router.get("/parfum", layananController.getParfum);
router.post("/parfum", (0, validate_middleware_1.validateBody)(layanan_schema_1.parfumSchema), layananController.createParfum);
router.put("/parfum/:id", (0, validate_middleware_1.validateBody)(layanan_schema_1.parfumSchema), layananController.updateParfum);
router.delete("/parfum/:id", layananController.deleteParfum);
exports.default = router;
//# sourceMappingURL=layanan.routes.js.map