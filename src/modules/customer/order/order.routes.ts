import { Router } from "express";
import * as orderController from "./order.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { createOrderSchema } from "./order.schema";

const router = Router();

router.use(verifyToken, requireRole(["customer"]));

router.post("/", validateBody(createOrderSchema), orderController.createOrder);
router.get("/active", orderController.getActiveOrders);
router.get("/history", orderController.getOrderHistory);
router.get("/:id", orderController.getOrderById);
router.get("/:id/qr", orderController.getOrderQR);

export default router;
