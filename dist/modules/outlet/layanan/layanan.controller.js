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
exports.deleteDurasiPerItem = exports.toggleDurasiPerItem = exports.updateDurasiPerItem = exports.createDurasiPerItem = exports.getDurasiPerItem = exports.deleteJenisPerItem = exports.toggleJenisPerItem = exports.updateJenisPerItem = exports.createJenisPerItem = exports.getJenisPerItem = exports.deleteParfum = exports.updateParfum = exports.createParfum = exports.getParfum = exports.deleteItemLayanan = exports.updateItemLayanan = exports.createItemLayanan = exports.getItemLayanan = exports.deleteDurasiLayanan = exports.updateDurasiLayanan = exports.createDurasiLayanan = exports.getDurasiLayanan = exports.deleteJenisLayanan = exports.updateJenisLayanan = exports.createJenisLayanan = exports.getJenisLayanan = void 0;
const layananService = __importStar(require("./layanan.service"));
const response_util_1 = require("../../../utils/response.util");
// ========== JENIS LAYANAN ==========
const getJenisLayanan = async (req, res, next) => {
    try {
        const data = await layananService.getJenisLayanan(req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("List jenis layanan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getJenisLayanan = getJenisLayanan;
const createJenisLayanan = async (req, res, next) => {
    try {
        const data = await layananService.createJenisLayanan(req.user.outletId, req.body);
        return res.status(201).json((0, response_util_1.success)("Jenis layanan berhasil ditambah", data));
    }
    catch (err) {
        next(err);
    }
};
exports.createJenisLayanan = createJenisLayanan;
const updateJenisLayanan = async (req, res, next) => {
    try {
        const data = await layananService.updateJenisLayanan(req.params.id, req.user.outletId, req.body);
        return res.status(200).json((0, response_util_1.success)("Jenis layanan berhasil diupdate", data));
    }
    catch (err) {
        next(err);
    }
};
exports.updateJenisLayanan = updateJenisLayanan;
const deleteJenisLayanan = async (req, res, next) => {
    try {
        await layananService.deleteJenisLayanan(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Jenis layanan berhasil dinonaktifkan"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteJenisLayanan = deleteJenisLayanan;
// ========== DURASI LAYANAN ==========
const getDurasiLayanan = async (req, res, next) => {
    try {
        const data = await layananService.getDurasiLayanan(req.user.outletId, req.query.jenis_layanan_id);
        return res.status(200).json((0, response_util_1.success)("List durasi layanan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getDurasiLayanan = getDurasiLayanan;
const createDurasiLayanan = async (req, res, next) => {
    try {
        const data = await layananService.createDurasiLayanan(req.user.outletId, req.body);
        return res.status(201).json((0, response_util_1.success)("Durasi layanan berhasil ditambah", data));
    }
    catch (err) {
        next(err);
    }
};
exports.createDurasiLayanan = createDurasiLayanan;
const updateDurasiLayanan = async (req, res, next) => {
    try {
        const data = await layananService.updateDurasiLayanan(req.params.id, req.user.outletId, req.body);
        return res.status(200).json((0, response_util_1.success)("Durasi layanan berhasil diupdate", data));
    }
    catch (err) {
        next(err);
    }
};
exports.updateDurasiLayanan = updateDurasiLayanan;
const deleteDurasiLayanan = async (req, res, next) => {
    try {
        await layananService.deleteDurasiLayanan(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Durasi layanan berhasil dinonaktifkan"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteDurasiLayanan = deleteDurasiLayanan;
// ========== ITEM LAYANAN ==========
const getItemLayanan = async (req, res, next) => {
    try {
        const data = await layananService.getItemLayanan(req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("List item layanan", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getItemLayanan = getItemLayanan;
const createItemLayanan = async (req, res, next) => {
    try {
        const data = await layananService.createItemLayanan(req.user.outletId, req.body);
        return res.status(201).json((0, response_util_1.success)("Item layanan berhasil ditambah", data));
    }
    catch (err) {
        next(err);
    }
};
exports.createItemLayanan = createItemLayanan;
const updateItemLayanan = async (req, res, next) => {
    try {
        const data = await layananService.updateItemLayanan(req.params.id, req.user.outletId, req.body);
        return res.status(200).json((0, response_util_1.success)("Item layanan berhasil diupdate", data));
    }
    catch (err) {
        next(err);
    }
};
exports.updateItemLayanan = updateItemLayanan;
const deleteItemLayanan = async (req, res, next) => {
    try {
        await layananService.deleteItemLayanan(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Item layanan berhasil dinonaktifkan"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteItemLayanan = deleteItemLayanan;
// Harga item di-handle langsung di ItemLayanan
// ========== PARFUM ==========
const getParfum = async (req, res, next) => {
    try {
        const data = await layananService.getParfum(req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("List parfum", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getParfum = getParfum;
const createParfum = async (req, res, next) => {
    try {
        const data = await layananService.createParfum(req.user.outletId, req.body);
        return res.status(201).json((0, response_util_1.success)("Parfum berhasil ditambah", data));
    }
    catch (err) {
        next(err);
    }
};
exports.createParfum = createParfum;
const updateParfum = async (req, res, next) => {
    try {
        const data = await layananService.updateParfum(req.params.id, req.user.outletId, req.body);
        return res.status(200).json((0, response_util_1.success)("Parfum berhasil diupdate", data));
    }
    catch (err) {
        next(err);
    }
};
exports.updateParfum = updateParfum;
const deleteParfum = async (req, res, next) => {
    try {
        await layananService.deleteParfum(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Parfum berhasil dinonaktifkan"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteParfum = deleteParfum;
// ========== JENIS PER ITEM ==========
const getJenisPerItem = async (req, res, next) => {
    try {
        const data = await layananService.getJenisPerItem(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("List jenis per item", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getJenisPerItem = getJenisPerItem;
const createJenisPerItem = async (req, res, next) => {
    try {
        const data = await layananService.createJenisPerItem(req.params.id, req.user.outletId, req.body);
        return res.status(201).json((0, response_util_1.success)("Jenis per item berhasil ditambah", data));
    }
    catch (err) {
        next(err);
    }
};
exports.createJenisPerItem = createJenisPerItem;
const updateJenisPerItem = async (req, res, next) => {
    try {
        const data = await layananService.updateJenisPerItem(req.params.id, req.user.outletId, req.body);
        return res.status(200).json((0, response_util_1.success)("Jenis per item berhasil diupdate", data));
    }
    catch (err) {
        next(err);
    }
};
exports.updateJenisPerItem = updateJenisPerItem;
const toggleJenisPerItem = async (req, res, next) => {
    try {
        const data = await layananService.toggleJenisPerItem(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Status Jenis per item berhasil diubah", data));
    }
    catch (err) {
        next(err);
    }
};
exports.toggleJenisPerItem = toggleJenisPerItem;
const deleteJenisPerItem = async (req, res, next) => {
    try {
        await layananService.deleteJenisPerItem(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Jenis per item berhasil dihapus"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteJenisPerItem = deleteJenisPerItem;
// ========== DURASI PER ITEM ==========
const getDurasiPerItem = async (req, res, next) => {
    try {
        const data = await layananService.getDurasiPerItem(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("List durasi per item", data));
    }
    catch (err) {
        next(err);
    }
};
exports.getDurasiPerItem = getDurasiPerItem;
const createDurasiPerItem = async (req, res, next) => {
    try {
        const data = await layananService.createDurasiPerItem(req.params.id, req.user.outletId, req.body);
        return res.status(201).json((0, response_util_1.success)("Durasi per item berhasil ditambah", data));
    }
    catch (err) {
        next(err);
    }
};
exports.createDurasiPerItem = createDurasiPerItem;
const updateDurasiPerItem = async (req, res, next) => {
    try {
        const data = await layananService.updateDurasiPerItem(req.params.id, req.user.outletId, req.body);
        return res.status(200).json((0, response_util_1.success)("Durasi per item berhasil diupdate", data));
    }
    catch (err) {
        next(err);
    }
};
exports.updateDurasiPerItem = updateDurasiPerItem;
const toggleDurasiPerItem = async (req, res, next) => {
    try {
        const data = await layananService.toggleDurasiPerItem(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Status Durasi per item berhasil diubah", data));
    }
    catch (err) {
        next(err);
    }
};
exports.toggleDurasiPerItem = toggleDurasiPerItem;
const deleteDurasiPerItem = async (req, res, next) => {
    try {
        await layananService.deleteDurasiPerItem(req.params.id, req.user.outletId);
        return res.status(200).json((0, response_util_1.success)("Durasi per item berhasil dihapus"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteDurasiPerItem = deleteDurasiPerItem;
//# sourceMappingURL=layanan.controller.js.map