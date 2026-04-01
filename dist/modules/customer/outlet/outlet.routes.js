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
const outletController = __importStar(require("./outlet.controller"));
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const outlet_schema_1 = require("./outlet.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["customer"]));
router.get("/nearby", (0, validate_middleware_1.validateQuery)(outlet_schema_1.nearbyOutletQuerySchema), outletController.getNearbyOutlets);
router.get("/:id", outletController.getOutletById);
router.get("/:id/layanan", outletController.getOutletLayanan);
router.get("/:id/durasi/:jenis_layanan_id", outletController.getDurasiByJenisLayanan);
router.get("/:id/items/:jenis_layanan_id", outletController.getItemsByJenisLayanan);
router.get("/:id/parfum", outletController.getParfumByOutlet);
router.get("/:id/items", outletController.getAllItems);
router.get("/:id/jenis-layanan-by-item/:item_id", outletController.getJenisLayananByItem);
exports.default = router;
//# sourceMappingURL=outlet.routes.js.map