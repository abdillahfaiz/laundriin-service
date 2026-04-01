import { Request, Response, NextFunction } from "express";
import { error } from "../utils/response.util";
import logger from "../utils/logger";

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(error(err.message));
    return;
  }

  // Multer errors
  if (err.name === "MulterError") {
    res.status(400).json(error(`Upload error: ${err.message}`));
    return;
  }

  // Prisma known errors
  if ((err as any).code === "P2002") {
    res.status(409).json(error("Data sudah ada (duplikat)"));
    return;
  }

  if ((err as any).code === "P2025") {
    res.status(404).json(error("Data tidak ditemukan"));
    return;
  }

  // Unknown error
  logger.error("Unhandled error:", err);
  res.status(500).json(error("Internal server error"));
};
