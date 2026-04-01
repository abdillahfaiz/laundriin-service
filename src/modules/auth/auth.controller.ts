import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { success } from "../../utils/response.util";

export const registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.registerCustomer(req.body);
    return res.status(201).json(success("Registrasi customer berhasil", data));
  } catch (err) {
    next(err);
  }
};

export const registerOutlet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.registerOutlet(req.body);
    return res.status(201).json(success("Registrasi outlet berhasil", data));
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.login(req.body);
    return res.status(200).json(success("Login berhasil", data));
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.refreshToken(req.body.refresh_token);
    return res.status(200).json(success("Token berhasil diperbarui", data));
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a production app, you'd blacklist the refresh token here
    return res.status(200).json(success("Logout berhasil"));
  } catch (err) {
    next(err);
  }
};

export const updateFcmToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.updateFcmToken(req.user!.userId, req.body.fcm_token);
    return res.status(200).json(success("FCM token berhasil diperbarui"));
  } catch (err) {
    next(err);
  }
};
