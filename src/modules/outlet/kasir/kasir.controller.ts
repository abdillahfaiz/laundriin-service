import { Request, Response, NextFunction } from "express";
import * as kasirService from "./kasir.service";
import { success } from "../../../utils/response.util";

export const getKasirList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await kasirService.getKasirList(req.user!.outletId!);
    return res.status(200).json(success("List kasir", data));
  } catch (err) { next(err); }
};

export const createKasir = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await kasirService.createKasir(req.user!.outletId!, req.body);
    return res.status(201).json(success("Kasir berhasil ditambah", data));
  } catch (err) { next(err); }
};

export const updateKasir = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await kasirService.updateKasir(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(200).json(success("Kasir berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const toggleKasir = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await kasirService.toggleKasir(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Status kasir berhasil diubah", data));
  } catch (err) { next(err); }
};
