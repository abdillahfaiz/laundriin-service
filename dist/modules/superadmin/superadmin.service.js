"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUser = exports.getUsers = exports.processPencairan = exports.getPencairanById = exports.getPencairanList = exports.updateOutletStatus = exports.getOutletById = exports.getOutlets = exports.getDashboard = void 0;
const database_1 = __importDefault(require("../../config/database"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const notification_util_1 = require("../../utils/notification.util");
// ========== DASHBOARD ==========
const getDashboard = async () => {
    const [totalOutlets, activeOutlets, totalOrders, totalUsers] = await Promise.all([
        database_1.default.outlet.count(),
        database_1.default.outlet.count({ where: { status: "aktif" } }),
        database_1.default.order.count(),
        database_1.default.user.count({ where: { role: "customer" } }),
    ]);
    const totalTransaksi = await database_1.default.payment.aggregate({
        where: { status: "settlement" },
        _sum: { total_bayar: true },
    });
    return {
        total_outlets: totalOutlets,
        active_outlets: activeOutlets,
        total_orders: totalOrders,
        total_users: totalUsers,
        total_transaksi: Number(totalTransaksi._sum.total_bayar || 0),
    };
};
exports.getDashboard = getDashboard;
// ========== OUTLET MANAGEMENT ==========
const getOutlets = async () => {
    return database_1.default.outlet.findMany({
        include: {
            admin: { select: { nama: true, nomor_telepon: true } },
        },
        orderBy: { created_at: "desc" },
    });
};
exports.getOutlets = getOutlets;
const getOutletById = async (outletId) => {
    const outlet = await database_1.default.outlet.findUnique({
        where: { id: outletId },
        include: {
            admin: { select: { nama: true, nomor_telepon: true } },
            operasional: true,
            _count: { select: { orders: true, kasir: true } },
        },
    });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    return outlet;
};
exports.getOutletById = getOutletById;
const updateOutletStatus = async (outletId, status) => {
    const outlet = await database_1.default.outlet.findUnique({ where: { id: outletId } });
    if (!outlet)
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan");
    return database_1.default.outlet.update({
        where: { id: outletId },
        data: { status: status },
    });
};
exports.updateOutletStatus = updateOutletStatus;
// ========== PENCAIRAN ==========
const getPencairanList = async () => {
    return database_1.default.pencairanSaldo.findMany({
        include: {
            outlet: { select: { nama_outlet: true } },
        },
        orderBy: { created_at: "desc" },
    });
};
exports.getPencairanList = getPencairanList;
const getPencairanById = async (id) => {
    const pencairan = await database_1.default.pencairanSaldo.findUnique({
        where: { id },
        include: {
            outlet: { select: { nama_outlet: true, admin_id: true } },
            superadmin: { select: { nama: true } },
        },
    });
    if (!pencairan)
        throw new error_middleware_1.AppError(404, "Pencairan tidak ditemukan");
    return pencairan;
};
exports.getPencairanById = getPencairanById;
const processPencairan = async (pencairanId, status, buktiTransfer, catatanAdmin, reviewerId) => {
    const pencairan = await database_1.default.pencairanSaldo.findUnique({
        where: { id: pencairanId },
        include: {
            outlet: {
                include: {
                    admin: { select: { fcm_token: true } },
                },
            },
        },
    });
    if (!pencairan)
        throw new error_middleware_1.AppError(404, "Pencairan tidak ditemukan");
    if (!["berhasil", "ditolak"].includes(status)) {
        throw new error_middleware_1.AppError(400, "Status tidak valid");
    }
    return database_1.default.$transaction(async (tx) => {
        const updated = await tx.pencairanSaldo.update({
            where: { id: pencairanId },
            data: {
                status: status,
                bukti_transfer: buktiTransfer || null,
                catatan_admin: catatanAdmin || null,
                reviewed_by: reviewerId,
                reviewed_at: new Date(),
            },
        });
        // If rejected, return saldo
        if (status === "ditolak") {
            const currentSaldo = pencairan.outlet.saldo;
            const newSaldo = currentSaldo.add(pencairan.jumlah);
            await tx.outlet.update({
                where: { id: pencairan.outlet_id },
                data: { saldo: newSaldo },
            });
            await tx.saldoLog.create({
                data: {
                    outlet_id: pencairan.outlet_id,
                    tipe: "kredit",
                    jumlah: pencairan.jumlah,
                    saldo_sebelum: currentSaldo,
                    saldo_sesudah: newSaldo,
                    referensi_id: pencairanId,
                    keterangan: "Pengembalian saldo - pencairan ditolak",
                },
            });
        }
        // Notify outlet admin
        const notifMessage = status === "berhasil"
            ? "Pencairan saldo Anda telah berhasil diproses."
            : `Pencairan saldo Anda ditolak. ${catatanAdmin || ""}`;
        await (0, notification_util_1.createAndSendNotification)(pencairan.outlet.admin_id, null, status === "berhasil" ? "Pencairan Berhasil" : "Pencairan Ditolak", notifMessage, "pencairan", pencairan.outlet.admin?.fcm_token || null);
        return updated;
    });
};
exports.processPencairan = processPencairan;
// ========== USER MANAGEMENT ==========
const getUsers = async () => {
    return database_1.default.user.findMany({
        select: {
            id: true,
            nama: true,
            nomor_telepon: true,
            role: true,
            is_active: true,
            created_at: true,
        },
        orderBy: { created_at: "desc" },
    });
};
exports.getUsers = getUsers;
const toggleUser = async (userId) => {
    const user = await database_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new error_middleware_1.AppError(404, "User tidak ditemukan");
    return database_1.default.user.update({
        where: { id: userId },
        data: { is_active: !user.is_active },
        select: { id: true, nama: true, is_active: true },
    });
};
exports.toggleUser = toggleUser;
//# sourceMappingURL=superadmin.service.js.map