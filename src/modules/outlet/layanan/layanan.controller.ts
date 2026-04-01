import { Request, Response, NextFunction } from "express";
import * as layananService from "./layanan.service";
import { success } from "../../../utils/response.util";

// ========== JENIS LAYANAN (Per KG) ==========
export const getJenisLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.getJenisLayanan(req.user!.outletId!);
    return res.status(200).json(success("List jenis layanan", data));
  } catch (err) { next(err); }
};

export const createJenisLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.createJenisLayanan(req.user!.outletId!, req.body);
    return res.status(201).json(success("Jenis layanan berhasil ditambah", data));
  } catch (err) { next(err); }
};

export const updateJenisLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.updateJenisLayanan(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(200).json(success("Jenis layanan berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const toggleJenisLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.toggleJenisLayanan(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Status jenis layanan berhasil diubah", data));
  } catch (err) { next(err); }
};

export const deleteJenisLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await layananService.deleteJenisLayanan(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Jenis layanan berhasil dinonaktifkan"));
  } catch (err) { next(err); }
};

// ========== DURASI LAYANAN (Per KG) ==========
export const getDurasiLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.getDurasiLayanan(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("List durasi layanan", data));
  } catch (err) { next(err); }
};

export const createDurasiLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.createDurasiLayanan(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(201).json(success("Durasi layanan berhasil ditambah", data));
  } catch (err) { next(err); }
};

export const updateDurasiLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.updateDurasiLayanan(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(200).json(success("Durasi layanan berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const toggleDurasiLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.toggleDurasiLayanan(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Status durasi layanan berhasil diubah", data));
  } catch (err) { next(err); }
};

export const deleteDurasiLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await layananService.deleteDurasiLayanan(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Durasi layanan berhasil dinonaktifkan"));
  } catch (err) { next(err); }
};

// ========== ITEM LAYANAN ==========
export const getItemLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.getItemLayanan(req.user!.outletId!);
    return res.status(200).json(success("List item layanan", data));
  } catch (err) { next(err); }
};

export const createItemLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.createItemLayanan(req.user!.outletId!, req.body);
    return res.status(201).json(success("Item layanan berhasil ditambah", data));
  } catch (err) { next(err); }
};

export const updateItemLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.updateItemLayanan(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(200).json(success("Item layanan berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const toggleItemLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.toggleItemLayanan(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Status item layanan berhasil diubah", data));
  } catch (err) { next(err); }
};

export const deleteItemLayanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await layananService.deleteItemLayanan(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Item layanan berhasil dinonaktifkan"));
  } catch (err) { next(err); }
};

// ========== PARFUM ==========
export const getParfum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.getParfum(req.user!.outletId!);
    return res.status(200).json(success("List parfum", data));
  } catch (err) { next(err); }
};

export const createParfum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.createParfum(req.user!.outletId!, req.body);
    return res.status(201).json(success("Parfum berhasil ditambah", data));
  } catch (err) { next(err); }
};

export const updateParfum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.updateParfum(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(200).json(success("Parfum berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const toggleParfum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.toggleParfum(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Status parfum berhasil diubah", data));
  } catch (err) { next(err); }
};

export const deleteParfum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await layananService.deleteParfum(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Parfum berhasil dinonaktifkan"));
  } catch (err) { next(err); }
};

// ========== JENIS PER ITEM ==========
export const getJenisPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.getJenisPerItem(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("List jenis per item", data));
  } catch (err) { next(err); }
};

export const createJenisPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.createJenisPerItem(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(201).json(success("Jenis per item berhasil ditambah", data));
  } catch (err) { next(err); }
};

export const updateJenisPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.updateJenisPerItem(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(200).json(success("Jenis per item berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const toggleJenisPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.toggleJenisPerItem(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Status Jenis per item berhasil diubah", data));
  } catch (err) { next(err); }
};

export const deleteJenisPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await layananService.deleteJenisPerItem(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Jenis per item berhasil dihapus"));
  } catch (err) { next(err); }
};

// ========== DURASI PER ITEM ==========
export const getDurasiPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.getDurasiPerItem(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("List durasi per item", data));
  } catch (err) { next(err); }
};

export const createDurasiPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.createDurasiPerItem(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(201).json(success("Durasi per item berhasil ditambah", data));
  } catch (err) { next(err); }
};

export const updateDurasiPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.updateDurasiPerItem(req.params.id as string, req.user!.outletId!, req.body);
    return res.status(200).json(success("Durasi per item berhasil diupdate", data));
  } catch (err) { next(err); }
};

export const toggleDurasiPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await layananService.toggleDurasiPerItem(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Status Durasi per item berhasil diubah", data));
  } catch (err) { next(err); }
};

export const deleteDurasiPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await layananService.deleteDurasiPerItem(req.params.id as string, req.user!.outletId!);
    return res.status(200).json(success("Durasi per item berhasil dihapus"));
  } catch (err) { next(err); }
};
