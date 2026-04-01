"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoverage = exports.getParfumByOutlet = exports.getDurasiPerItem = exports.getJenisPerItem = exports.getItemsPerItem = exports.getDurasiPerKg = exports.getLayananPerKg = exports.getOutletById = exports.getNearbyOutlets = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const error_middleware_1 = require("../../../middlewares/error.middleware");
const haversine_util_1 = require("../../../utils/haversine.util");
const dayjs_1 = __importDefault(require("dayjs"));
const HARI_MAP = {
    0: "minggu",
    1: "senin",
    2: "selasa",
    3: "rabu",
    4: "kamis",
    5: "jumat",
    6: "sabtu",
};
const checkIsOpen = (operasional) => {
    const now = (0, dayjs_1.default)();
    const hariIni = HARI_MAP[now.day()];
    const ops = operasional.find((o) => o.hari === hariIni);
    if (!ops || !ops.is_open)
        return false;
    const currentTime = now.format("HH:mm");
    return currentTime >= ops.jam_buka && currentTime <= ops.jam_tutup;
};
const getNearbyOutlets = async (lat, lng, radius, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const outlets = await database_1.default.outlet.findMany({
        where: { status: "aktif" },
        include: { operasional: true },
    });
    const allNearby = outlets
        .map((outlet) => {
        const jarak_km = (0, haversine_util_1.haversine)(lat, lng, Number(outlet.lat), Number(outlet.lng));
        return {
            id: outlet.id,
            nama_outlet: outlet.nama_outlet,
            alamat: outlet.alamat,
            foto_outlet: outlet.foto_outlet,
            lat: outlet.lat,
            lng: outlet.lng,
            jarak_km,
            is_buka: checkIsOpen(outlet.operasional),
            operasional: outlet.operasional,
        };
    })
        .filter((o) => o.jarak_km <= radius)
        .sort((a, b) => a.jarak_km - b.jarak_km);
    const paginatedData = allNearby.slice(skip, skip + limit);
    return {
        data: paginatedData,
        pagination: {
            page,
            limit,
            total: allNearby.length,
            totalPages: Math.ceil(allNearby.length / limit),
        },
    };
};
exports.getNearbyOutlets = getNearbyOutlets;
const getOutletById = async (outletId) => {
    const outlet = await database_1.default.outlet.findUnique({
        where: { id: outletId, status: "aktif" },
        include: { operasional: { orderBy: { hari: "asc" } } },
    });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    return { ...outlet, is_buka: checkIsOpen(outlet.operasional) };
};
exports.getOutletById = getOutletById;
// ==================== PER KG ====================
const getLayananPerKg = async (outletId) => {
    const outlet = await database_1.default.outlet.findUnique({ where: { id: outletId, status: "aktif" } });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    return database_1.default.jenisLayanan.findMany({
        where: { outlet_id: outletId, is_active: true },
        select: { id: true, nama: true, deskripsi: true },
    });
};
exports.getLayananPerKg = getLayananPerKg;
const getDurasiPerKg = async (outletId, jenisLayananId) => {
    const jenis = await database_1.default.jenisLayanan.findUnique({ where: { id: jenisLayananId } });
    if (!jenis || jenis.outlet_id !== outletId || !jenis.is_active) {
        throw new error_middleware_1.AppError(404, "Jenis layanan tidak ditemukan");
    }
    return database_1.default.durasiLayanan.findMany({
        where: { jenis_layanan_id: jenisLayananId, is_active: true },
        select: { id: true, nama: true, estimasi_jam: true, harga: true },
        orderBy: { estimasi_jam: "asc" },
    });
};
exports.getDurasiPerKg = getDurasiPerKg;
// ==================== PER ITEM ====================
const getItemsPerItem = async (outletId) => {
    const outlet = await database_1.default.outlet.findUnique({ where: { id: outletId, status: "aktif" } });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    return database_1.default.itemLayanan.findMany({
        where: { outlet_id: outletId, is_active: true },
        select: { id: true, nama_item: true, foto_item: true },
    });
};
exports.getItemsPerItem = getItemsPerItem;
const getJenisPerItem = async (outletId, itemId) => {
    const item = await database_1.default.itemLayanan.findUnique({ where: { id: itemId } });
    if (!item || item.outlet_id !== outletId || !item.is_active) {
        throw new error_middleware_1.AppError(404, "Item tidak ditemukan");
    }
    return database_1.default.jenisPerItem.findMany({
        where: { item_layanan_id: itemId, is_active: true },
        select: { id: true, nama: true, deskripsi: true },
    });
};
exports.getJenisPerItem = getJenisPerItem;
const getDurasiPerItem = async (outletId, jenisId) => {
    const jenis = await database_1.default.jenisPerItem.findUnique({
        where: { id: jenisId },
        include: { item_layanan: true },
    });
    if (!jenis || jenis.item_layanan.outlet_id !== outletId || !jenis.is_active) {
        throw new error_middleware_1.AppError(404, "Jenis per item tidak ditemukan");
    }
    return database_1.default.durasiPerItem.findMany({
        where: { jenis_per_item_id: jenisId, is_active: true },
        select: { id: true, nama: true, estimasi_jam: true, harga: true },
        orderBy: { estimasi_jam: "asc" },
    });
};
exports.getDurasiPerItem = getDurasiPerItem;
// ==================== PARFUM ====================
const getParfumByOutlet = async (outletId) => {
    const outlet = await database_1.default.outlet.findUnique({ where: { id: outletId, status: "aktif" } });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    return database_1.default.parfum.findMany({
        where: { outlet_id: outletId, is_active: true },
        select: { id: true, nama: true, harga: true },
    });
};
exports.getParfumByOutlet = getParfumByOutlet;
// ==================== COVERAGE ====================
const getCoverage = async (outletId, lat, lng) => {
    const outlet = await database_1.default.outlet.findUnique({ where: { id: outletId, status: "aktif" } });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    const jarak_km = (0, haversine_util_1.haversine)(Number(outlet.lat), Number(outlet.lng), lat, lng);
    const coverages = await database_1.default.outletCoverage.findMany({
        where: { outlet_id: outletId, is_active: true },
    });
    const validCoverages = coverages.filter((c) => jarak_km <= c.max_radius_km);
    if (validCoverages.length === 0) {
        return {
            is_covered: false,
            jarak_km,
            coverage: null,
            message: "Lokasi di luar jangkauan antar jemput outlet ini",
        };
    }
    // Termurah
    const termurah = validCoverages.sort((a, b) => Number(a.ongkos_kirim) - Number(b.ongkos_kirim))[0];
    return {
        is_covered: true,
        jarak_km,
        coverage: termurah,
    };
};
exports.getCoverage = getCoverage;
//# sourceMappingURL=outlet.service.js.map