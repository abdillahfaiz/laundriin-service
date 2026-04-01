"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const response_util_1 = require("../utils/response.util");
/**
 * Validate request body against a Zod schema
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));
            res.status(400).json((0, response_util_1.error)("Validasi gagal", errors));
            return;
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
/**
 * Validate request query against a Zod schema
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));
            res.status(400).json((0, response_util_1.error)("Validasi query gagal", errors));
            return;
        }
        Object.keys(result.data).forEach((key) => {
            req.query[key] = result.data[key];
        });
        next();
    };
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validate.middleware.js.map