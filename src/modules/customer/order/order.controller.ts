import { Request, Response, NextFunction } from "express";
import * as orderService from "./order.service";
import { success } from "../../../utils/response.util";

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.createOrder(req.body, req.user!);
    return res.status(201).json(success("Order berhasil dibuat", data));
  } catch (err) {
    next(err);
  }
};

export const getActiveOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.getActiveOrders(req.user!.userId);
    return res.status(200).json(success("Order aktif", data));
  } catch (err) {
    next(err);
  }
};

export const getOrderHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const result = await orderService.getOrderHistory(req.user!.userId, page, limit);
    return res.status(200).json(success("Riwayat order", result.data, result.pagination));
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.getOrderById(req.params.id as string, req.user!.userId);
    return res.status(200).json(success("Detail order", data));
  } catch (err) {
    next(err);
  }
};

export const getOrderQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.getOrderQR(req.params.id as string, req.user!.userId);
    return res.status(200).json(success("QR code order", data));
  } catch (err) {
    next(err);
  }
};
