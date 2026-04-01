"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoverage = exports.updateCoverage = exports.createCoverage = exports.getCoverages = exports.updateOperasional = exports.getOperasional = exports.updateProfile = exports.getProfile = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const error_middleware_1 = require("../../../middlewares/error.middleware");
const getProfile = async (outletId) => {
    const outlet = await database_1.default.outlet.findUnique({
        where: { id: outletId },
        include: {
            admin: { select: { nama: true, nomor_telepon: true } },
        },
    });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    return outlet;
};
exports.getProfile = getProfile;
const updateProfile = async (outletId, data) => {
    return database_1.default.outlet.update({
        where: { id: outletId },
        data: {
            nama_outlet: data.nama_outlet,
            alamat: data.alamat,
            foto_outlet: data.foto_outlet,
            lat: data.lat,
            lng: data.lng,
        },
    });
};
exports.updateProfile = updateProfile;
const getOperasional = async (outletId) => {
    return database_1.default.outletOperasional.findMany({
        where: { outlet_id: outletId },
        orderBy: { hari: "asc" },
    });
};
exports.getOperasional = getOperasional;
const updateOperasional = async (outletId, data) => {
    const results = [];
    for (const item of data) {
        const result = await database_1.default.outletOperasional.upsert({
            where: {
                outlet_id_hari: {
                    outlet_id: outletId,
                    hari: item.hari,
                },
            },
            create: {
                outlet_id: outletId,
                hari: item.hari,
                jam_buka: item.jam_buka,
                jam_tutup: item.jam_tutup,
                is_open: item.is_open,
            },
            update: {
                jam_buka: item.jam_buka,
                jam_tutup: item.jam_tutup,
                is_open: item.is_open,
            },
        });
        results.push(result);
    }
    return results;
};
exports.updateOperasional = updateOperasional;
// ==================== COVERAGE ====================
const getCoverages = async (outletId) => {
    return database_1.default.outletCoverage.findMany({
        where: { outlet_id: outletId },
        orderBy: { max_radius_km: "asc" },
    });
};
exports.getCoverages = getCoverages;
const createCoverage = async (outletId, data) => {
    return database_1.default.outletCoverage.create({
        data: {
            outlet_id: outletId,
            nama_area: data.nama_area,
            max_radius_km: data.max_radius_km,
            ongkos_kirim: data.ongkos_kirim,
        },
    });
};
exports.createCoverage = createCoverage;
const updateCoverage = async (id, outletId, data) => {
    const existing = await database_1.default.outletCoverage.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId) {
        throw new error_middleware_1.AppError(404, "Coverage tidak ditemukan");
    }
    return database_1.default.outletCoverage.update({
        where: { id },
        data: {
            nama_area: data.nama_area,
            max_radius_km: data.max_radius_km,
            ongkos_kirim: data.ongkos_kirim,
            is_active: data.is_active,
        },
    });
};
exports.updateCoverage = updateCoverage;
const deleteCoverage = async (id, outletId) => {
    const existing = await database_1.default.outletCoverage.findUnique({ where: { id } });
    if (!existing || existing.outlet_id !== outletId) {
        throw new error_middleware_1.AppError(404, "Coverage tidak ditemukan");
    }
    return database_1.default.outletCoverage.delete({ where: { id } });
};
exports.deleteCoverage = deleteCoverage;
//# sourceMappingURL=profile.service.js.map