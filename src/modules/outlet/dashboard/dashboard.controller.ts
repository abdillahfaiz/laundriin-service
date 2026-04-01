import { Request, Response, NextFunction } from "express";
import * as dashboardService from "./dashboard.service";
import { success } from "../../../utils/response.util";

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const periode = (req.query.periode as string) || "today";
    const data = await dashboardService.getDashboard(req.user!.outletId!, periode);
    return res.status(200).json(success("Dashboard outlet", data));
  } catch (err) {
    next(err);
  }
};
