import { Router } from "express";
import * as orderController from "./order.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";
import { validateBody, validateQuery } from "../../../middlewares/validate.middleware";
import {
  outletOrderQuerySchema,
  scanQrSchema,
  timbangSchema,
  updateStatusSchema,
  walkinOrderSchema,
  konfirmasiPickupSchema,
  dijemputSchema,
} from "./order.schema";

const router = Router();

router.use(verifyToken, requireRole(["admin_outlet", "kasir"]));

// Order CRUD
router.get("/", validateQuery(outletOrderQuerySchema), orderController.getOrders);
router.get("/pickup", orderController.getPickupOrders);
router.get("/:id", orderController.getOrderById);
router.post("/scan", validateBody(scanQrSchema), orderController.scanQR);
router.put("/:id/timbang", validateBody(timbangSchema), orderController.timbangOrder);
router.put("/:id/status", validateBody(updateStatusSchema), orderController.updateStatus);
router.post("/walkin", validateBody(walkinOrderSchema), orderController.createWalkinOrder);

// Pickup / Antar Jemput
router.put("/:id/pickup/konfirmasi", validateBody(konfirmasiPickupSchema), orderController.konfirmasiPickup);
router.put("/:id/pickup/berangkat", orderController.pickupBerangkat);
router.put("/:id/pickup/dijemput", validateBody(dijemputSchema), orderController.pickupDijemput);
router.put("/:id/pickup/diantar", orderController.pickupDiantar);
router.put("/:id/pickup/selesai-antar", orderController.pickupSelesaiAntar);

export default router;
