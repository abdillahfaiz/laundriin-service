"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const response_util_1 = require("../utils/response.util");
/**
 * Verify JWT token from Authorization header
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json((0, response_util_1.error)("Token tidak ditemukan"));
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            res.status(401).json((0, response_util_1.error)("Token sudah expired"));
            return;
        }
        res.status(401).json((0, response_util_1.error)("Token tidak valid"));
        return;
    }
};
exports.verifyToken = verifyToken;
/**
 * Require specific roles
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json((0, response_util_1.error)("Unauthorized"));
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json((0, response_util_1.error)("Akses ditolak. Role tidak sesuai"));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.middleware.js.map