import { Request, Response, NextFunction } from "express";
import * as outletService from "./outlet.service";
import { success } from "../../../utils/response.util";

export const getNearbyOutlets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius) || 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const result = await outletService.getNearbyOutlets(lat, lng, radius, page, limit);
    return res.status(200).json(success("Outlet terdekat", result.data, result.pagination));
  } catch (err) { next(err); }
};

export const getOutletById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await outletService.getOutletById(req.params.id as string);
    return res.status(200).json(success("Detail outlet", data));
  } catch (err) { next(err); }
};

// ==================== PER KG ====================
export const getLayananPerKg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await outletService.getLayananPerKg(req.params.id as string);
    return res.status(200).json(success("List jenis layanan (Per KG)", data));
  } catch (err) { next(err); }
};

export const getDurasiPerKg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await outletService.getDurasiPerKg(req.params.id as string, req.params.jenisId as string);
    return res.status(200).json(success("List durasi (Per KG)", data));
  } catch (err) { next(err); }
};

// ==================== PER ITEM ====================
export const getItemsPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await outletService.getItemsPerItem(req.params.id as string);
    return res.status(200).json(success("List item layanan", data));
  } catch (err) { next(err); }
};

export const getJenisPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await outletService.getJenisPerItem(req.params.id as string, req.params.itemId as string);
    return res.status(200).json(success("List jenis per item", data));
  } catch (err) { next(err); }
};

export const getDurasiPerItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await outletService.getDurasiPerItem(req.params.id as string, req.params.jenisId as string);
    return res.status(200).json(success("List durasi per item", data));
  } catch (err) { next(err); }
};

// ==================== PARFUM ====================
export const getParfumByOutlet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await outletService.getParfumByOutlet(req.params.id as string);
    return res.status(200).json(success("List parfum", data));
  } catch (err) { next(err); }
};

// ==================== COVERAGE ====================
export const getCoverage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const data = await outletService.getCoverage(req.params.id as string, lat, lng);
    return res.status(200).json(success("Cek area jangkauan", data));
  } catch (err) { next(err); }
};
