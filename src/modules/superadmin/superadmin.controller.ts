import { Request, Response, NextFunction } from "express";
import * as superadminService from "./superadmin.service";
import { success } from "../../utils/response.util";

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await superadminService.getDashboard();
    return res.status(200).json(success("Dashboard superadmin", data));
  } catch (err) { next(err); }
};

export const getOutlets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await superadminService.getOutlets();
    return res.status(200).json(success("List outlet", data));
  } catch (err) { next(err); }
};

export const getOutletById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await superadminService.getOutletById(req.params.id as string);
    return res.status(200).json(success("Detail outlet", data));
  } catch (err) { next(err); }
};

export const updateOutletStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await superadminService.updateOutletStatus(req.params.id as string, req.body.status);
    return res.status(200).json(success("Status outlet berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const getPencairanList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await superadminService.getPencairanList();
    return res.status(200).json(success("List pencairan", data));
  } catch (err) { next(err); }
};

export const getPencairanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await superadminService.getPencairanById(req.params.id as string);
    return res.status(200).json(success("Detail pencairan", data));
  } catch (err) { next(err); }
};

export const processPencairan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await superadminService.processPencairan(
      req.params.id as string,
      req.body.status,
      req.body.bukti_transfer,
      req.body.catatan_admin,
      req.user!.userId
    );
    return res.status(200).json(success("Pencairan berhasil diproses", data));
  } catch (err) { next(err); }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await superadminService.getUsers();
    return res.status(200).json(success("List users", data));
  } catch (err) { next(err); }
};

export const toggleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await superadminService.toggleUser(req.params.id as string);
    return res.status(200).json(success("Status user berhasil diubah", data));
  } catch (err) { next(err); }
};
