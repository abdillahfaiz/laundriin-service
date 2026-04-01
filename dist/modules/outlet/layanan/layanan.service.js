"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDurasiPerItem = exports.toggleDurasiPerItem = exports.updateDurasiPerItem = exports.createDurasiPerItem = exports.getDurasiPerItem = exports.deleteJenisPerItem = exports.toggleJenisPerItem = exports.updateJenisPerItem = exports.createJenisPerItem = exports.getJenisPerItem = exports.deleteParfum = exports.updateParfum = exports.createParfum = exports.getParfum = exports.deleteItemLayanan = exports.updateItemLayanan = exports.createItemLayanan = exports.getItemLayanan = exports.deleteDurasiLayanan = exports.updateDurasiLayanan = exports.createDurasiLayanan = exports.getDurasiLayanan = exports.deleteJenisLayanan = exports.updateJenisLayanan = exports.createJenisLayanan = exports.getJenisLayanan = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const error_middleware_1 = require("../../../middlewares/error.middleware");
// ========== JENIS LAYANAN ==========
const getJenisLayanan = async (outletId) => {
    return database_1.default.jenisLayanan.findMany({
        where: { outlet_id: outletId, is_active: true },
        orderBy: { created_at: "desc" },
    });
};
exports.getJenisLayanan = getJenisLayanan;
const createJenisLayanan = async (outletId, data) => {
    return database_1.default.jenisLayanan.create({
        data: { outlet_id: outletId, ...data },
    });
};
exports.createJenisLayanan = createJenisLayanan;
const updateJenisLayanan = async (id, outletId, data) => {
    const existing = await database_1.default.jenisLayanan.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Jenis layanan tidak ditemukan");
    return database_1.default.jenisLayanan.update({ where: { id }, data });
};
exports.updateJenisLayanan = updateJenisLayanan;
const deleteJenisLayanan = async (id, outletId) => {
    const existing = await database_1.default.jenisLayanan.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Jenis layanan tidak ditemukan");
    // Soft delete
    return database_1.default.jenisLayanan.update({ where: { id }, data: { is_active: false } });
};
exports.deleteJenisLayanan = deleteJenisLayanan;
// ========== DURASI LAYANAN ==========
const getDurasiLayanan = async (outletId, jenisLayananId) => {
    const where = { outlet_id: outletId, is_active: true };
    if (jenisLayananId)
        where.jenis_layanan_id = jenisLayananId;
    return database_1.default.durasiLayanan.findMany({
        where,
        include: { jenis_layanan: { select: { nama: true } } },
        orderBy: { estimasi_jam: "asc" },
    });
};
exports.getDurasiLayanan = getDurasiLayanan;
const createDurasiLayanan = async (outletId, data) => {
    // Validate jenis layanan belongs to outlet
    const jenis = await database_1.default.jenisLayanan.findUnique({ where: { id: data.jenis_layanan_id } });
    if (!jenis || jenis.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Jenis layanan tidak ditemukan");
    return database_1.default.durasiLayanan.create({
        data: { outlet_id: outletId, ...data },
    });
};
exports.createDurasiLayanan = createDurasiLayanan;
const updateDurasiLayanan = async (id, outletId, data) => {
    const existing = await database_1.default.durasiLayanan.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Durasi layanan tidak ditemukan");
    return database_1.default.durasiLayanan.update({ where: { id }, data });
};
exports.updateDurasiLayanan = updateDurasiLayanan;
const deleteDurasiLayanan = async (id, outletId) => {
    const existing = await database_1.default.durasiLayanan.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Durasi layanan tidak ditemukan");
    return database_1.default.durasiLayanan.update({ where: { id }, data: { is_active: false } });
};
exports.deleteDurasiLayanan = deleteDurasiLayanan;
// ========== ITEM LAYANAN ==========
const getItemLayanan = async (outletId) => {
    return database_1.default.itemLayanan.findMany({
        where: { outlet_id: outletId, is_active: true },
        orderBy: { created_at: "desc" },
    });
};
exports.getItemLayanan = getItemLayanan;
const createItemLayanan = async (outletId, data) => {
    // Simple creation now, no pivot tables
    return database_1.default.itemLayanan.create({
        data: { outlet_id: outletId, ...data },
    });
};
exports.createItemLayanan = createItemLayanan;
const updateItemLayanan = async (id, outletId, data) => {
    const existing = await database_1.default.itemLayanan.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Item layanan tidak ditemukan");
    return database_1.default.itemLayanan.update({
        where: { id },
        data,
    });
};
exports.updateItemLayanan = updateItemLayanan;
const deleteItemLayanan = async (id, outletId) => {
    const existing = await database_1.default.itemLayanan.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Item layanan tidak ditemukan");
    return database_1.default.itemLayanan.update({ where: { id }, data: { is_active: false } });
};
exports.deleteItemLayanan = deleteItemLayanan;
// ========== PARFUM ==========
const getParfum = async (outletId) => {
    return database_1.default.parfum.findMany({
        where: { outlet_id: outletId, is_active: true },
        orderBy: { nama: "asc" },
    });
};
exports.getParfum = getParfum;
const createParfum = async (outletId, data) => {
    return database_1.default.parfum.create({
        data: { outlet_id: outletId, ...data },
    });
};
exports.createParfum = createParfum;
const updateParfum = async (id, outletId, data) => {
    const existing = await database_1.default.parfum.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Parfum tidak ditemukan");
    return database_1.default.parfum.update({ where: { id }, data });
};
exports.updateParfum = updateParfum;
const deleteParfum = async (id, outletId) => {
    const existing = await database_1.default.parfum.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Parfum tidak ditemukan");
    return database_1.default.parfum.update({ where: { id }, data: { is_active: false } });
};
exports.deleteParfum = deleteParfum;
// ========== JENIS PER ITEM ==========
const getJenisPerItem = async (itemId, outletId) => {
    const item = await database_1.default.itemLayanan.findUnique({ where: { id: itemId } });
    if (!item || item.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Item layanan tidak ditemukan");
    return database_1.default.jenisPerItem.findMany({
        where: { item_layanan_id: itemId },
        orderBy: { created_at: "desc" },
    });
};
exports.getJenisPerItem = getJenisPerItem;
const createJenisPerItem = async (itemId, outletId, data) => {
    const item = await database_1.default.itemLayanan.findUnique({ where: { id: itemId } });
    if (!item || item.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Item layanan tidak ditemukan");
    return database_1.default.jenisPerItem.create({
        data: { item_layanan_id: itemId, ...data },
    });
};
exports.createJenisPerItem = createJenisPerItem;
const updateJenisPerItem = async (id, outletId, data) => {
    const existing = await database_1.default.jenisPerItem.findUnique({
        where: { id },
        include: { item_layanan: true }
    });
    if (!existing || existing.item_layanan.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Jenis layanan per item tidak ditemukan");
    return database_1.default.jenisPerItem.update({ where: { id }, data });
};
exports.updateJenisPerItem = updateJenisPerItem;
const toggleJenisPerItem = async (id, outletId) => {
    const existing = await database_1.default.jenisPerItem.findUnique({
        where: { id },
        include: { item_layanan: true }
    });
    if (!existing || existing.item_layanan.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Jenis layanan per item tidak ditemukan");
    return database_1.default.jenisPerItem.update({ where: { id }, data: { is_active: !existing.is_active } });
};
exports.toggleJenisPerItem = toggleJenisPerItem;
const deleteJenisPerItem = async (id, outletId) => {
    const existing = await database_1.default.jenisPerItem.findUnique({
        where: { id },
        include: { item_layanan: true }
    });
    if (!existing || existing.item_layanan.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Jenis layanan per item tidak ditemukan");
    return database_1.default.jenisPerItem.delete({ where: { id } });
};
exports.deleteJenisPerItem = deleteJenisPerItem;
// ========== DURASI PER ITEM ==========
const getDurasiPerItem = async (jenisId, outletId) => {
    const jenis = await database_1.default.jenisPerItem.findUnique({
        where: { id: jenisId },
        include: { item_layanan: true }
    });
    if (!jenis || jenis.item_layanan.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Jenis per item tidak ditemukan");
    return database_1.default.durasiPerItem.findMany({
        where: { jenis_per_item_id: jenisId },
        orderBy: { estimasi_jam: "asc" },
    });
};
exports.getDurasiPerItem = getDurasiPerItem;
const createDurasiPerItem = async (jenisId, outletId, data) => {
    const jenis = await database_1.default.jenisPerItem.findUnique({
        where: { id: jenisId },
        include: { item_layanan: true }
    });
    if (!jenis || jenis.item_layanan.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Jenis per item tidak ditemukan");
    return database_1.default.durasiPerItem.create({
        data: { jenis_per_item_id: jenisId, ...data },
    });
};
exports.createDurasiPerItem = createDurasiPerItem;
const updateDurasiPerItem = async (id, outletId, data) => {
    const existing = await database_1.default.durasiPerItem.findUnique({
        where: { id },
        include: { jenis_per_item: { include: { item_layanan: true } } }
    });
    if (!existing || existing.jenis_per_item.item_layanan.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Durasi per item tidak ditemukan");
    return database_1.default.durasiPerItem.update({ where: { id }, data });
};
exports.updateDurasiPerItem = updateDurasiPerItem;
const toggleDurasiPerItem = async (id, outletId) => {
    const existing = await database_1.default.durasiPerItem.findUnique({
        where: { id },
        include: { jenis_per_item: { include: { item_layanan: true } } }
    });
    if (!existing || existing.jenis_per_item.item_layanan.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Durasi per item tidak ditemukan");
    return database_1.default.durasiPerItem.update({ where: { id }, data: { is_active: !existing.is_active } });
};
exports.toggleDurasiPerItem = toggleDurasiPerItem;
const deleteDurasiPerItem = async (id, outletId) => {
    const existing = await database_1.default.durasiPerItem.findUnique({
        where: { id },
        include: { jenis_per_item: { include: { item_layanan: true } } }
    });
    if (!existing || existing.jenis_per_item.item_layanan.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Durasi per item tidak ditemukan");
    return database_1.default.durasiPerItem.delete({ where: { id } });
};
exports.deleteDurasiPerItem = deleteDurasiPerItem;
//# sourceMappingURL=layanan.service.js.map