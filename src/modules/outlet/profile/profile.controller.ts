import { Request, Response, NextFunction } from "express";
import * as profileService from "./profile.service";
import { success } from "../../../utils/response.util";

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await profileService.getProfile(req.user!.outletId!);
    return res.status(200).json(success("Profil outlet", data));
  } catch (err) { next(err); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await profileService.updateProfile(req.user!.outletId!, req.body);
    return res.status(200).json(success("Profil outlet berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const getOperasional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await profileService.getOperasional(req.user!.outletId!);
    return res.status(200).json(success("Jam operasional", data));
  } catch (err) { next(err); }
};

export const updateOperasional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await profileService.updateOperasional(req.user!.outletId!, req.body.operasional);
    return res.status(200).json(success("Jam operasional berhasil diupdate", data));
  } catch (err) { next(err); }
};

// ==================== COVERAGE ====================
export const getCoverages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await profileService.getCoverages(req.user!.outletId!);
    return res.status(200).json(success("List coverage outlet", data));
  } catch (err) { next(err); }
};

export const createCoverage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await profileService.createCoverage(req.user!.outletId!, req.body);
    return res.status(201).json(success("Coverage berhasil ditambah", data));
  } catch (err) { next(err); }
};

export const updateCoverage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await profileService.updateCoverage(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(200).json(success("Coverage berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const deleteCoverage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await profileService.deleteCoverage(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Coverage berhasil dihapus"));
  } catch (err) { next(err); }
};
