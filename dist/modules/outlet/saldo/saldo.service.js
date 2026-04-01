"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPencairanById = exports.getPencairanList = exports.requestPencairan = exports.getSaldoLog = exports.getSaldo = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const error_middleware_1 = require("../../../middlewares/error.middleware");
const library_1 = require("@prisma/client/runtime/library");
const getSaldo = async (outletId) => {
    const outlet = await database_1.default.outlet.findUnique({
        where: { id: outletId },
        select: { saldo: true },
    });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    return { saldo: outlet.saldo };
};
exports.getSaldo = getSaldo;
const getSaldoLog = async (outletId) => {
    return database_1.default.saldoLog.findMany({
        where: { outlet_id: outletId },
        orderBy: { created_at: "desc" },
        take: 50,
    });
};
exports.getSaldoLog = getSaldoLog;
const requestPencairan = async (outletId, data) => {
    const outlet = await database_1.default.outlet.findUnique({ where: { id: outletId } });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    // [CRITICAL] Validate: jumlah <= outlets.saldo
    if (new library_1.Decimal(data.jumlah).gt(outlet.saldo)) {
        throw new error_middleware_1.AppError(400, "Saldo tidak mencukupi");
    }
    // [CRITICAL] Max 1 pending/diproses request at a time
    const pendingRequest = await database_1.default.pencairanSaldo.findFirst({
        where: {
            outlet_id: outletId,
            status: { in: ["pending", "diproses"] },
        },
    });
    if (pendingRequest) {
        throw new error_middleware_1.AppError(409, "Masih ada request pencairan yang sedang diproses");
    }
    // Hold saldo
    const newSaldo = outlet.saldo.sub(new library_1.Decimal(data.jumlah));
    return database_1.default.$transaction(async (tx) => {
        // Debit saldo
        await tx.outlet.update({
            where: { id: outletId },
            data: { saldo: newSaldo },
        });
        await tx.saldoLog.create({
            data: {
                outlet_id: outletId,
                tipe: "debit",
                jumlah: data.jumlah,
                saldo_sebelum: outlet.saldo,
                saldo_sesudah: newSaldo,
                keterangan: "Hold saldo untuk pencairan",
            },
        });
        return tx.pencairanSaldo.create({
            data: {
                outlet_id: outletId,
                jumlah: data.jumlah,
                nomor_rekening: data.nomor_rekening,
                nama_pemilik_rekening: data.nama_pemilik_rekening,
                bank_tujuan: data.bank_tujuan,
            },
        });
    });
};
exports.requestPencairan = requestPencairan;
const getPencairanList = async (outletId) => {
    return database_1.default.pencairanSaldo.findMany({
        where: { outlet_id: outletId },
        orderBy: { created_at: "desc" },
    });
};
exports.getPencairanList = getPencairanList;
const getPencairanById = async (pencairanId, outletId) => {
    const pencairan = await database_1.default.pencairanSaldo.findUnique({
        where: { id: pencairanId },
        include: {
            superadmin: { select: { nama: true } },
        },
    });
    if (!pencairan || pencairan.outlet_id !== outletId) {
        throw new error_middleware_1.AppError(404, "Request pencairan tidak ditemukan");
    }
    return pencairan;
};
exports.getPencairanById = getPencairanById;
//# sourceMappingURL=saldo.service.js.map