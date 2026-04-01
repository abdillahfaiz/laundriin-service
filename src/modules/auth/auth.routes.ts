import { Router } from "express";
import * as authController from "./auth.controller";
import { validateBody } from "../../middlewares/validate.middleware";
import { verifyToken } from "../../middlewares/auth.middleware";
import {
  registerCustomerSchema,
  registerOutletSchema,
  loginSchema,
  refreshTokenSchema,
  fcmTokenSchema,
} from "./auth.schema";

const router = Router();

// Public routes
router.post("/register/customer", validateBody(registerCustomerSchema), authController.registerCustomer);
router.post("/register/outlet", validateBody(registerOutletSchema), authController.registerOutlet);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/refresh-token", validateBody(refreshTokenSchema), authController.refreshToken);

// Authenticated routes
router.post("/logout", verifyToken, authController.logout);
router.put("/fcm-token", verifyToken, validateBody(fcmTokenSchema), authController.updateFcmToken);

export default router;
