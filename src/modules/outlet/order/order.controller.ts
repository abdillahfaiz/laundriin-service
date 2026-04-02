import { Request, Response, NextFunction } from "express";
import * as orderService from "./order.service";
import { error, success } from "../../../utils/response.util";
import { uploadToCloudinary } from "@/utils/upload.util";

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.getOrders(req.user!.outletId!, {
      status: req.query.status as string | undefined,
      tipe_layanan: req.query.tipe_layanan as string | undefined,
      jenis_order: req.query.jenis_order as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    return res.status(200).json(success("List order outlet", result.data, result.pagination));
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.getOrderById(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Detail order", data));
  } catch (err) {
    next(err);
  }
};

export const scanQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.scanQR(req.body.qr_code, req.user!.outletId!);
    return res.status(200).json(success("Detail order (scan)", data));
  } catch (err) {
    next(err);
  }
};

export const timbangOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json(error("Foto timbangan wajib diunggah"));
    }

    const fotoUrl = await uploadToCloudinary(req.file.buffer, "laundriin_timbangan");

    const data = await orderService.timbangOrder(
      req.params.id as string,
      req.body.berat_aktual, 
      fotoUrl,              
      req.user!
    );
    
    return res.status(200).json(success("Berat berhasil diinput", data));
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.updateOrderStatus(
      req.params.id as string,
      req.body.status,
      req.body.note,
      req.user!
    );
    return res.status(200).json(success("Status order berhasil diupdate", data));
  } catch (err) {
    next(err);
  }
};

export const createWalkinOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.createWalkinOrder(req.body, req.user!);
    return res.status(201).json(success("Order walk-in berhasil dibuat", data));
  } catch (err) {
    next(err);
  }
};

// ==================== PICKUP / ANTAR JEMPUT ====================

export const getPickupOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.getPickupOrders(req.user!.outletId!);
    return res.status(200).json(success("List order antar jemput", data));
  } catch (err) {
    next(err);
  }
};

export const konfirmasiPickup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.konfirmasiPickup(
      req.params.id as string,
      req.body.kurir_id,
      req.user!
    );
    return res.status(200).json(success("Order dikonfirmasi, kurir ditugaskan", data));
  } catch (err) {
    next(err);
  }
};

export const pickupBerangkat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.pickupBerangkat(req.params.id as string, req.user!);
    return res.status(200).json(success("Kurir sedang menuju lokasi", data));
  } catch (err) {
    next(err);
  }
};

export const pickupDijemput = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.pickupDijemput(
      req.params.id as string,
      req.body.foto_barang_pickup,
      req.user!
    );
    return res.status(200).json(success("Barang telah dijemput", data));
  } catch (err) {
    next(err);
  }
};

export const pickupDiantar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.pickupDiantar(req.params.id as string, req.user!);
    return res.status(200).json(success("Kurir sedang mengantar laundry", data));
  } catch (err) {
    next(err);
  }
};

export const pickupSelesaiAntar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.pickupSelesaiAntar(req.params.id as string, req.user!);
    return res.status(200).json(success("Order selesai diantar", data));
  } catch (err) {
    next(err);
  }
};
