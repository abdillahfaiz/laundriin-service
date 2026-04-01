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
exports.getJenisLayananByItem = exports.getAllItems = exports.getParfumByOutlet = exports.getItemsByJenisLayanan = exports.getDurasiByJenisLayanan = exports.getOutletLayanan = exports.getOutletById = exports.getNearbyOutlets = void 0;
const outletService = __importStar(require("./outlet.service"));
const response_util_1 = require("../../../utils/response.util");
const getNearbyOutlets = async (req, res, next) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        const radius = Number(req.query.radius) || 10;
        const data = await outletService.getNearbyOutlets(lat, lng, radius);
        return res.status(200).json((0, response_util_1.success)("Outlet terdekat", data));
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
const getOutletLayanan = async (req, res, next) => {
    try {
        const data = await outletService.getOutletLayanan(req.params.id);
        return res.status(200).json((0, response_util_1.success)("List jenis layanan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getOutletLayanan = getOutletLayanan;
const getDurasiByJenisLayanan = async (req, res, next) => {
    try {
        const data = await outletService.getDurasiByJenisLayanan(req.params.id, req.params.jenis_layanan_id);
        return res.status(200).json((0, response_util_1.success)("List durasi layanan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getDurasiByJenisLayanan = getDurasiByJenisLayanan;
const getItemsByJenisLayanan = async (req, res, next) => {
    try {
        const data = await outletService.getItemsByJenisLayanan(req.params.id, req.params.jenis_layanan_id);
        return res.status(200).json((0, response_util_1.success)("List item layanan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getItemsByJenisLayanan = getItemsByJenisLayanan;
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
const getAllItems = async (req, res, next) => {
    try {
        const data = await outletService.getAllItems(req.params.id);
        return res.status(200).json((0, response_util_1.success)("List item layanan outlet", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getAllItems = getAllItems;
const getJenisLayananByItem = async (req, res, next) => {
    try {
        const data = await outletService.getJenisLayananByItem(req.params.id, req.params.item_id);
        return res.status(200).json((0, response_util_1.success)("Detail jenis layanan dan durasi berdasarkan item", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getJenisLayananByItem = getJenisLayananByItem;
//# sourceMappingURL=outlet.controller.js.map