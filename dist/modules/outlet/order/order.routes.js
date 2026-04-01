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
const orderController = __importStar(require("./order.controller"));
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const order_schema_1 = require("./order.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["admin_outlet", "kasir"]));
// Order CRUD
router.get("/", (0, validate_middleware_1.validateQuery)(order_schema_1.outletOrderQuerySchema), orderController.getOrders);
router.get("/pickup", orderController.getPickupOrders);
router.get("/:id", orderController.getOrderById);
router.post("/scan", (0, validate_middleware_1.validateBody)(order_schema_1.scanQrSchema), orderController.scanQR);
router.put("/:id/timbang", (0, validate_middleware_1.validateBody)(order_schema_1.timbangSchema), orderController.timbangOrder);
router.put("/:id/status", (0, validate_middleware_1.validateBody)(order_schema_1.updateStatusSchema), orderController.updateStatus);
router.post("/walkin", (0, validate_middleware_1.validateBody)(order_schema_1.walkinOrderSchema), orderController.createWalkinOrder);
// Pickup / Antar Jemput
router.put("/:id/pickup/konfirmasi", (0, validate_middleware_1.validateBody)(order_schema_1.konfirmasiPickupSchema), orderController.konfirmasiPickup);
router.put("/:id/pickup/berangkat", orderController.pickupBerangkat);
router.put("/:id/pickup/dijemput", (0, validate_middleware_1.validateBody)(order_schema_1.dijemputSchema), orderController.pickupDijemput);
router.put("/:id/pickup/diantar", orderController.pickupDiantar);
router.put("/:id/pickup/selesai-antar", orderController.pickupSelesaiAntar);
exports.default = router;
//# sourceMappingURL=order.routes.js.map