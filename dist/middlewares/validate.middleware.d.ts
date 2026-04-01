import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod/v4";
/**
 * Validate request body against a Zod schema
 */
export declare const validateBody: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validate request query against a Zod schema
 */
export declare const validateQuery: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.middleware.d.ts.map