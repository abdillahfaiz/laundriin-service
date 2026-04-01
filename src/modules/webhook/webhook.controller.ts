import { Request, Response, NextFunction } from "express";
import * as webhookService from "./webhook.service";

export const midtransWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await webhookService.handleMidtransWebhook(req.body);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
