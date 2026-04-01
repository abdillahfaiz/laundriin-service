"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFcmToken = exports.logout = exports.refreshToken = exports.login = exports.registerOutlet = exports.registerCustomer = void 0;
const authService = __importStar(require("./auth.service"));
const response_util_1 = require("../../utils/response.util");
const registerCustomer = async (req, res, next) => {
    try {
        const data = await authService.registerCustomer(req.body);
        return res.status(201).json((0, response_util_1.success)("Registrasi customer berhasil", data));
    }
    catch (err) {
        next(err);
    }
};
exports.registerCustomer = registerCustomer;
const registerOutlet = async (req, res, next) => {
    try {
        const data = await authService.registerOutlet(req.body);
        return res.status(201).json((0, response_util_1.success)("Registrasi outlet berhasil", data));
    }
    catch (err) {
        next(err);
    }
};
exports.registerOutlet = registerOutlet;
const login = async (req, res, next) => {
    try {
        const data = await authService.login(req.body);
        return res.status(200).json((0, response_util_1.success)("Login berhasil", data));
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const data = await authService.refreshToken(req.body.refresh_token);
        return res.status(200).json((0, response_util_1.success)("Token berhasil diperbarui", data));
    }
    catch (err) {
        next(err);
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res, next) => {
    try {
        // In a production app, you'd blacklist the refresh token here
        return res.status(200).json((0, response_util_1.success)("Logout berhasil"));
    }
    catch (err) {
        next(err);
    }
};
exports.logout = logout;
const updateFcmToken = async (req, res, next) => {
    try {
        await authService.updateFcmToken(req.user.userId, req.body.fcm_token);
        return res.status(200).json((0, response_util_1.success)("FCM token berhasil diperbarui"));
    }
    catch (err) {
        next(err);
    }
};
exports.updateFcmToken = updateFcmToken;
//# sourceMappingURL=auth.controller.js.map