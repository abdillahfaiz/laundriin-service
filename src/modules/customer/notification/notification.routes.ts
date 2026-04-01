import { Router } from "express";
import * as notificationController from "./notification.controller";
import { verifyToken, requireRole } from "../../../middlewares/auth.middleware";

const router = Router();

router.use(verifyToken, requireRole(["customer"]));

router.get("/", notificationController.getNotifications);
router.put("/:id/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);

export default router;
