"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.success = void 0;
const success = (message, data = null, pagination) => {
    const res = { success: true, message, data };
    if (pagination)
        res.pagination = pagination;
    return res;
};
exports.success = success;
const error = (message, errors = null) => ({
    success: false,
    message,
    errors,
});
exports.error = error;
//# sourceMappingURL=response.util.js.map