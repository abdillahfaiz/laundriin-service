"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJenisLayananByItem = exports.getAllItems = exports.getParfumByOutlet = exports.getItemsByJenisLayanan = exports.getDurasiByJenisLayanan = exports.getOutletLayanan = exports.getOutletById = exports.getNearbyOutlets = void 0;
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
const getNearbyOutlets = async (lat, lng, radius) => {
    const outlets = await database_1.default.outlet.findMany({
        where: { status: "aktif" },
        include: {
            operasional: true,
        },
    });
    // Calculate distance and filter by radius
    const nearbyOutlets = outlets
        .map((outlet) => {
        const jarak_km = (0, haversine_util_1.haversine)(lat, lng, Number(outlet.lat), Number(outlet.lng));
        const is_buka = checkIsOpen(outlet.operasional);
        return {
            id: outlet.id,
            nama_outlet: outlet.nama_outlet,
            alamat: outlet.alamat,
            foto_outlet: outlet.foto_outlet,
            lat: outlet.lat,
            lng: outlet.lng,
            jarak_km,
            is_buka,
            operasional: outlet.operasional,
        };
    })
        .filter((outlet) => outlet.jarak_km <= radius)
        .sort((a, b) => a.jarak_km - b.jarak_km);
    return nearbyOutlets;
};
exports.getNearbyOutlets = getNearbyOutlets;
const getOutletById = async (outletId) => {
    const outlet = await database_1.default.outlet.findUnique({
        where: { id: outletId, status: "aktif" },
        include: {
            operasional: { orderBy: { hari: "asc" } },
        },
    });
    if (!outlet) {
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    }
    return {
        ...outlet,
        is_buka: checkIsOpen(outlet.operasional),
    };
};
exports.getOutletById = getOutletById;
const getOutletLayanan = async (outletId) => {
    const outlet = await database_1.default.outlet.findUnique({ where: { id: outletId, status: "aktif" } });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    const layanan = await database_1.default.jenisLayanan.findMany({
        where: { outlet_id: outletId, is_active: true },
        select: {
            id: true,
            nama: true,
            deskripsi: true,
        },
    });
    return layanan;
};
exports.getOutletLayanan = getOutletLayanan;
const getDurasiByJenisLayanan = async (outletId, jenisLayananId) => {
    const durasi = await database_1.default.durasiLayanan.findMany({
        where: {
            outlet_id: outletId,
            jenis_layanan_id: jenisLayananId,
            is_active: true,
            jenis_layanan: { is_active: true },
        },
        select: {
            id: true,
            nama: true,
            estimasi_jam: true,
            harga: true,
        },
        orderBy: { estimasi_jam: "asc" },
    });
    return durasi;
};
exports.getDurasiByJenisLayanan = getDurasiByJenisLayanan;
const getItemsByJenisLayanan = async (outletId, jenisLayananId) => {
    throw new error_middleware_1.AppError(400, "Method ini tidak lagi didukung di service v3 (per_kg dipisah dengan per_item)");
};
exports.getItemsByJenisLayanan = getItemsByJenisLayanan;
const getParfumByOutlet = async (outletId) => {
    const parfum = await database_1.default.parfum.findMany({
        where: { outlet_id: outletId, is_active: true },
        select: {
            id: true,
            nama: true,
            harga: true,
        },
    });
    return parfum;
};
exports.getParfumByOutlet = getParfumByOutlet;
const getAllItems = async (outletId) => {
    const items = await database_1.default.itemLayanan.findMany({
        where: {
            outlet_id: outletId,
            is_active: true,
        },
        include: {
            jenis_per_item: {
                where: { is_active: true },
                include: {
                    durasi_per_item: {
                        where: { is_active: true },
                        select: { id: true, nama: true, estimasi_jam: true, harga: true },
                    },
                },
            },
        },
    });
    return items;
};
exports.getAllItems = getAllItems;
const getJenisLayananByItem = async (outletId, itemId) => {
    const item = await database_1.default.itemLayanan.findFirst({
        where: {
            id: itemId,
            outlet_id: outletId,
            is_active: true,
        },
        include: {
            jenis_per_item: {
                where: { is_active: true },
                include: {
                    durasi_per_item: {
                        where: { is_active: true },
                        select: { id: true, nama: true, estimasi_jam: true, harga: true },
                    },
                },
            },
        },
    });
    if (!item) {
        throw new error_middleware_1.AppError(404, "Item tidak ditemukan");
    }
    return item;
};
exports.getJenisLayananByItem = getJenisLayananByItem;
//# sourceMappingURL=outlet.service.js.map