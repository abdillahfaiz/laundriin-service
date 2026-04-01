import { Router } from "express";
import * as webhookController from "./webhook.controller";

const router = Router();

// Webhook is public (Midtrans calls this)
router.post("/midtrans", webhookController.midtransWebhook);

export default router;
