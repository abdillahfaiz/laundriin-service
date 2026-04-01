import { Request, Response, NextFunction } from "express";
import * as saldoService from "./saldo.service";
import { success } from "../../../utils/response.util";

export const getSaldo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await saldoService.getSaldo(req.user!.outletId!);
    return res.status(200).json(success("Saldo outlet", data));
  } catch (err) { next(err); }
};

export const getSaldoLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await saldoService.getSaldoLog(req.user!.outletId!);
    return res.status(200).json(success("Riwayat saldo", data));
  } catch (err) { next(err); }
};

export const requestPencairan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await saldoService.requestPencairan(req.user!.outletId!, req.body);
    return res.status(201).json(success("Request pencairan berhasil", data));
  } catch (err) { next(err); }
};

export const getPencairanList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await saldoService.getPencairanList(req.user!.outletId!);
    return res.status(200).json(success("List pencairan", data));
  } catch (err) { next(err); }
};

export const getPencairanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await saldoService.getPencairanById(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Detail pencairan", data));
  } catch (err) { next(err); }
};
