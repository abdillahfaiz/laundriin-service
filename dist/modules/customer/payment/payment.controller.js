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
exports.checkPaymentStatus = exports.getPaymentDetail = exports.createPayment = exports.getTagihan = void 0;
const paymentService = __importStar(require("./payment.service"));
const response_util_1 = require("../../../utils/response.util");
const getTagihan = async (req, res, next) => {
    try {
        const data = await paymentService.getTagihan(req.params.id, req.user.userId);
        return res.status(200).json((0, response_util_1.success)("Detail tagihan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getTagihan = getTagihan;
const createPayment = async (req, res, next) => {
    try {
        const data = await paymentService.createPayment(req.params.id, req.user.userId, req.body.metode_pembayaran);
        return res.status(201).json((0, response_util_1.success)("Pembayaran berhasil dibuat", data));
    }
    catch (err) {
        next(err);
    }
};
exports.createPayment = createPayment;
const getPaymentDetail = async (req, res, next) => {
    try {
        const data = await paymentService.getPaymentDetail(req.params.id, req.user.userId);
        return res.status(200).json((0, response_util_1.success)("Detail pembayaran", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getPaymentDetail = getPaymentDetail;
const checkPaymentStatus = async (req, res, next) => {
    try {
        const data = await paymentService.checkPaymentStatus(req.params.id, req.user.userId);
        return res.status(200).json((0, response_util_1.success)("Status pembayaran", data));
    }
    catch (err) {
        next(err);
    }
};
exports.checkPaymentStatus = checkPaymentStatus;
//# sourceMappingURL=payment.controller.js.map