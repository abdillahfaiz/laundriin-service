"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleKasir = exports.updateKasir = exports.createKasir = exports.getKasirList = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const error_middleware_1 = require("../../../middlewares/error.middleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getKasirList = async (outletId) => {
    return database_1.default.outletKasir.findMany({
        where: { outlet_id: outletId },
        include: {
            user: {
                select: { id: true, nama: true, nomor_telepon: true, is_active: true, created_at: true },
            },
        },
        orderBy: { created_at: "desc" },
    });
};
exports.getKasirList = getKasirList;
const createKasir = async (outletId, data) => {
    // Check if phone number exists
    const existing = await database_1.default.user.findUnique({ where: { nomor_telepon: data.nomor_telepon } });
    if (existing)
        throw new error_middleware_1.AppError(409, "Nomor telepon sudah terdaftar");
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
    return database_1.default.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                nama: data.nama,
                nomor_telepon: data.nomor_telepon,
                password: hashedPassword,
                role: "kasir",
            },
        });
        const kasir = await tx.outletKasir.create({
            data: {
                outlet_id: outletId,
                user_id: user.id,
            },
            include: {
                user: { select: { id: true, nama: true, nomor_telepon: true } },
            },
        });
        return kasir;
    });
};
exports.createKasir = createKasir;
const updateKasir = async (kasirId, outletId, data) => {
    const kasir = await database_1.default.outletKasir.findUnique({
        where: { id: kasirId },
        include: { user: true },
    });
    if (!kasir || kasir.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Kasir tidak ditemukan");
    if (data.nomor_telepon && data.nomor_telepon !== kasir.user.nomor_telepon) {
        const existing = await database_1.default.user.findUnique({ where: { nomor_telepon: data.nomor_telepon } });
        if (existing)
            throw new error_middleware_1.AppError(409, "Nomor telepon sudah terdaftar");
    }
    return database_1.default.user.update({
        where: { id: kasir.user_id },
        data: {
            nama: data.nama,
            nomor_telepon: data.nomor_telepon,
        },
        select: { id: true, nama: true, nomor_telepon: true },
    });
};
exports.updateKasir = updateKasir;
const toggleKasir = async (kasirId, outletId) => {
    const kasir = await database_1.default.outletKasir.findUnique({
        where: { id: kasirId },
        include: { user: true },
    });
    if (!kasir || kasir.outlet_id !== outletId)
        throw new error_middleware_1.AppError(404, "Kasir tidak ditemukan");
    const updated = await database_1.default.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: kasir.user_id },
            data: { is_active: !kasir.user.is_active },
        });
        return tx.outletKasir.update({
            where: { id: kasirId },
            data: { is_active: !kasir.is_active },
            include: {
                user: { select: { id: true, nama: true, is_active: true } },
            },
        });
    });
    return updated;
};
exports.toggleKasir = toggleKasir;
//# sourceMappingURL=kasir.service.js.map