"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const response_util_1 = require("../utils/response.util");
const logger_1 = __importDefault(require("../utils/logger"));
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
/**
 * Global error handler middleware
 */
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json((0, response_util_1.error)(err.message));
        return;
    }
    // Multer errors
    if (err.name === "MulterError") {
        res.status(400).json((0, response_util_1.error)(`Upload error: ${err.message}`));
        return;
    }
    // Prisma known errors
    if (err.code === "P2002") {
        res.status(409).json((0, response_util_1.error)("Data sudah ada (duplikat)"));
        return;
    }
    if (err.code === "P2025") {
        res.status(404).json((0, response_util_1.error)("Data tidak ditemukan"));
        return;
    }
    // Unknown error
    logger_1.default.error("Unhandled error:", err);
    res.status(500).json((0, response_util_1.error)("Internal server error"));
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map