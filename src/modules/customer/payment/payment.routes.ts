import { Router } from "express";
import * as paymentController from "./payment.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { createPaymentSchema } from "./payment.schema";

const router = Router();

router.use(verifyToken, requireRole(["customer"]));

// Using /customer/orders/:id/tagihan etc. — these are sub-routes mounted under /customer/orders
router.get("/:id/tagihan", paymentController.getTagihan);
router.post("/:id/payment", validateBody(createPaymentSchema), paymentController.createPayment);
router.get("/:id/payment", paymentController.getPaymentDetail);
router.post("/:id/payment/check", paymentController.checkPaymentStatus);

export default router;
