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
exports.getCoverage = exports.getParfumByOutlet = exports.getDurasiPerItem = exports.getJenisPerItem = exports.getItemsPerItem = exports.getDurasiPerKg = exports.getLayananPerKg = exports.getOutletById = exports.getNearbyOutlets = void 0;
const outletService = __importStar(require("./outlet.service"));
const response_util_1 = require("../../../utils/response.util");
const getNearbyOutlets = async (req, res, next) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        const radius = Number(req.query.radius) || 10;
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const result = await outletService.getNearbyOutlets(lat, lng, radius, page, limit);
        return res.status(200).json((0, response_util_1.success)("Outlet terdekat", result.data, result.pagination));
    }
    catch (err) {
        next(err);
    }
};
exports.getNearbyOutlets = getNearbyOutlets;
const getOutletById = async (req, res, next) => {
    try {
        const data = await outletService.getOutletById(req.params.id);
        return res.status(200).json((0, response_util_1.success)("Detail outlet", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getOutletById = getOutletById;
// ==================== PER KG ====================
const getLayananPerKg = async (req, res, next) => {
    try {
        const data = await outletService.getLayananPerKg(req.params.id);
        return res.status(200).json((0, response_util_1.success)("List jenis layanan (Per KG)", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getLayananPerKg = getLayananPerKg;
const getDurasiPerKg = async (req, res, next) => {
    try {
        const data = await outletService.getDurasiPerKg(req.params.id, req.params.jenisId);
        return res.status(200).json((0, response_util_1.success)("List durasi (Per KG)", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getDurasiPerKg = getDurasiPerKg;
// ==================== PER ITEM ====================
const getItemsPerItem = async (req, res, next) => {
    try {
        const data = await outletService.getItemsPerItem(req.params.id);
        return res.status(200).json((0, response_util_1.success)("List item layanan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getItemsPerItem = getItemsPerItem;
const getJenisPerItem = async (req, res, next) => {
    try {
        const data = await outletService.getJenisPerItem(req.params.id, req.params.itemId);
        return res.status(200).json((0, response_util_1.success)("List jenis per item", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getJenisPerItem = getJenisPerItem;
const getDurasiPerItem = async (req, res, next) => {
    try {
        const data = await outletService.getDurasiPerItem(req.params.id, req.params.jenisId);
        return res.status(200).json((0, response_util_1.success)("List durasi per item", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getDurasiPerItem = getDurasiPerItem;
// ==================== PARFUM ====================
const getParfumByOutlet = async (req, res, next) => {
    try {
        const data = await outletService.getParfumByOutlet(req.params.id);
        return res.status(200).json((0, response_util_1.success)("List parfum", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getParfumByOutlet = getParfumByOutlet;
// ==================== COVERAGE ====================
const getCoverage = async (req, res, next) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        const data = await outletService.getCoverage(req.params.id, lat, lng);
        return res.status(200).json((0, response_util_1.success)("Cek area jangkauan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getCoverage = getCoverage;
//# sourceMappingURL=outlet.controller.js.map