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
exports.getOrderQR = exports.getOrderById = exports.getOrderHistory = exports.getActiveOrders = exports.createOrder = void 0;
const orderService = __importStar(require("./order.service"));
const response_util_1 = require("../../../utils/response.util");
const createOrder = async (req, res, next) => {
    try {
        const data = await orderService.createOrder(req.body, req.user);
        return res.status(201).json((0, response_util_1.success)("Order berhasil dibuat", data));
    }
    catch (err) {
        next(err);
    }
};
exports.createOrder = createOrder;
const getActiveOrders = async (req, res, next) => {
    try {
        const data = await orderService.getActiveOrders(req.user.userId);
        return res.status(200).json((0, response_util_1.success)("Order aktif", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getActiveOrders = getActiveOrders;
const getOrderHistory = async (req, res, next) => {
    try {
        const data = await orderService.getOrderHistory(req.user.userId);
        return res.status(200).json((0, response_util_1.success)("Riwayat order", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderHistory = getOrderHistory;
const getOrderById = async (req, res, next) => {
    try {
        const data = await orderService.getOrderById(req.params.id, req.user.userId);
        return res.status(200).json((0, response_util_1.success)("Detail order", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderById = getOrderById;
const getOrderQR = async (req, res, next) => {
    try {
        const data = await orderService.getOrderQR(req.params.id, req.user.userId);
        return res.status(200).json((0, response_util_1.success)("QR code order", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderQR = getOrderQR;
//# sourceMappingURL=order.controller.js.map