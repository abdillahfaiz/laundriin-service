import { Request, Response, NextFunction } from "express";
import * as notificationService from "./notification.service";
import { success } from "../../../utils/response.util";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notificationService.getNotifications(req.user!.userId);
    return res.status(200).json(success("List notifikasi", data));
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAsRead(req.params.id as string, req.user!.userId);
    return res.status(200).json(success("Notifikasi sudah dibaca"));
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    return res.status(200).json(success("Semua notifikasi sudah dibaca"));
  } catch (err) {
    next(err);
  }
};
