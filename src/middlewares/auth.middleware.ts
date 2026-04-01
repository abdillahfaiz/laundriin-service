import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { error } from "../utils/response.util";
import { Role } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  role: Role;
  outletId: string | null;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verify JWT token from Authorization header
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json(error("Token tidak ditemukan"));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json(error("Token sudah expired"));
      return;
    }
    res.status(401).json(error("Token tidak valid"));
    return;
  }
};

/**
 * Require specific roles
 */
export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(error("Unauthorized"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(error("Akses ditolak. Role tidak sesuai"));
      return;
    }

    next();
  };
};
