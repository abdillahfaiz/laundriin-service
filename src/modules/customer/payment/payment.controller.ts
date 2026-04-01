import { Request, Response, NextFunction } from "express";
import * as paymentService from "./payment.service";
import { success } from "../../../utils/response.util";

export const getTagihan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await paymentService.getTagihan(req.params.id as string, req.user!.userId);
    return res.status(200).json(success("Detail tagihan", data));
  } catch (err) {
    next(err);
  }
};

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await paymentService.createPayment(
      req.params.id as string,
      req.user!.userId,
      req.body.metode_pembayaran
    );
    return res.status(201).json(success("Pembayaran berhasil dibuat", data));
  } catch (err) {
    next(err);
  }
};

export const getPaymentDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await paymentService.getPaymentDetail(req.params.id as string, req.user!.userId);
    return res.status(200).json(success("Detail pembayaran", data));
  } catch (err) {
    next(err);
  }
};

export const checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await paymentService.checkPaymentStatus(req.params.id as string, req.user!.userId);
    return res.status(200).json(success("Status pembayaran", data));
  } catch (err) {
    next(err);
  }
};
