import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
export interface JwtPayload {
    userId: string;
    role: Role;
    outletId: string | null;
}
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
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Require specific roles
 */
export declare const requireRole: (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map