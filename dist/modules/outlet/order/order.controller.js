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
exports.pickupSelesaiAntar = exports.pickupDiantar = exports.pickupDijemput = exports.pickupBerangkat = exports.konfirmasiPickup = exports.getPickupOrders = exports.createWalkinOrder = exports.updateStatus = exports.timbangOrder = exports.scanQR = exports.getOrderById = exports.getOrders = void 0;
const orderService = __importStar(require("./order.service"));
const response_util_1 = require("../../../utils/response.util");
const getOrders = async (req, res, next) => {
    try {
        const result = await orderService.getOrders(req.user.outletId, {
            status: req.query.status,
            tipe_layanan: req.query.tipe_layanan,
            jenis_order: req.query.jenis_order,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
        });
        return res.status(200).json((0, response_util_1.success)("List order outlet", result.data, result.pagination));
    }
    catch (err) {
        next(err);
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res, next) => {
    try {
        const data = await orderService.getOrderById(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Detail order", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderById = getOrderById;
const scanQR = async (req, res, next) => {
    try {
        const data = await orderService.scanQR(req.body.qr_code, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Detail order (scan)", data));
    }
    catch (err) {
        next(err);
    }
};
exports.scanQR = scanQR;
const timbangOrder = async (req, res, next) => {
    try {
        const data = await orderService.timbangOrder(req.params.id, req.body.berat_aktual, req.body.foto_timbangan, req.user);
        return res.status(200).json((0, response_util_1.success)("Berat berhasil diinput", data));
    }
    catch (err) {
        next(err);
    }
};
exports.timbangOrder = timbangOrder;
const updateStatus = async (req, res, next) => {
    try {
        const data = await orderService.updateOrderStatus(req.params.id, req.body.status, req.body.note, req.user);
        return res.status(200).json((0, response_util_1.success)("Status order berhasil diupdate", data));
    }
    catch (err) {
        next(err);
    }
};
exports.updateStatus = updateStatus;
const createWalkinOrder = async (req, res, next) => {
    try {
        const data = await orderService.createWalkinOrder(req.body, req.user);
        return res.status(201).json((0, response_util_1.success)("Order walk-in berhasil dibuat", data));
    }
    catch (err) {
        next(err);
    }
};
exports.createWalkinOrder = createWalkinOrder;
// ==================== PICKUP / ANTAR JEMPUT ====================
const getPickupOrders = async (req, res, next) => {
    try {
        const data = await orderService.getPickupOrders(req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("List order antar jemput", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getPickupOrders = getPickupOrders;
const konfirmasiPickup = async (req, res, next) => {
    try {
        const data = await orderService.konfirmasiPickup(req.params.id, req.body.kurir_id, req.user);
        return res.status(200).json((0, response_util_1.success)("Order dikonfirmasi, kurir ditugaskan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.konfirmasiPickup = konfirmasiPickup;
const pickupBerangkat = async (req, res, next) => {
    try {
        const data = await orderService.pickupBerangkat(req.params.id, req.user);
        return res.status(200).json((0, response_util_1.success)("Kurir sedang menuju lokasi", data));
    }
    catch (err) {
        next(err);
    }
};
exports.pickupBerangkat = pickupBerangkat;
const pickupDijemput = async (req, res, next) => {
    try {
        const data = await orderService.pickupDijemput(req.params.id, req.body.foto_barang_pickup, req.user);
        return res.status(200).json((0, response_util_1.success)("Barang telah dijemput", data));
    }
    catch (err) {
        next(err);
    }
};
exports.pickupDijemput = pickupDijemput;
const pickupDiantar = async (req, res, next) => {
    try {
        const data = await orderService.pickupDiantar(req.params.id, req.user);
        return res.status(200).json((0, response_util_1.success)("Kurir sedang mengantar laundry", data));
    }
    catch (err) {
        next(err);
    }
};
exports.pickupDiantar = pickupDiantar;
const pickupSelesaiAntar = async (req, res, next) => {
    try {
        const data = await orderService.pickupSelesaiAntar(req.params.id, req.user);
        return res.status(200).json((0, response_util_1.success)("Order selesai diantar", data));
    }
    catch (err) {
        next(err);
    }
};
exports.pickupSelesaiAntar = pickupSelesaiAntar;
//# sourceMappingURL=order.controller.js.map