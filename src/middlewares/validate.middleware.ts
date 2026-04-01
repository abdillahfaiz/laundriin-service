import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod/v4";
import { error } from "../utils/response.util";

/**
 * Validate request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      res.status(400).json(error("Validasi gagal", errors));
      return;
    }

    req.body = result.data;
    next();
  };
};

/**
 * Validate request query against a Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      res.status(400).json(error("Validasi query gagal", errors));
      return;
    }

    Object.keys(result.data as Record<string, any>).forEach((key) => {
      (req.query as any)[key] = (result.data as any)[key];
    });
    next();
  };
};
