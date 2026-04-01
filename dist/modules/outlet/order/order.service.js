"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalkinOrder = exports.updateOrderStatus = exports.timbangOrder = exports.scanQR = exports.getOrderById = exports.getOrders = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const error_middleware_1 = require("../../../middlewares/error.middleware");
const notification_util_1 = require("../../../utils/notification.util");
const qrcode_util_1 = require("../../../utils/qrcode.util");
const library_1 = require("@prisma/client/runtime/library");
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dayjs_1 = __importDefault(require("dayjs"));
const generateTransactionId = () => {
    const date = (0, dayjs_1.default)().format("YYYYMMDD");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TRX-${date}-${result}`;
};
// [CRITICAL] Validate order belongs to outlet
const validateOutletOwnership = (order, outletId) => {
    if (order.outlet_id !== outletId) {
        throw new error_middleware_1.AppError(403, "Order bukan milik outlet Anda");
    }
};
// Valid status transitions
const STATUS_FLOW = {
    menunggu_drop: ["menunggu_ditimbang"],
    menunggu_ditimbang: ["sedang_diproses", "dibatalkan"],
    sedang_diproses: ["siap_diambil"],
    siap_diambil: ["selesai"],
};
const getOrders = async (outletId, status, date) => {
    const where = { outlet_id: outletId };
    if (status)
        where.status = status;
    if (date) {
        const start = (0, dayjs_1.default)(date).startOf("day").toDate();
        const end = (0, dayjs_1.default)(date).endOf("day").toDate();
        where.created_at = { gte: start, lte: end };
    }
    const orders = await database_1.default.order.findMany({
        where,
        include: {
            customer: { select: { nama: true, nomor_telepon: true } },
            jenis_layanan: { select: { nama: true } },
        },
        orderBy: { created_at: "desc" },
    });
    return orders;
};
exports.getOrders = getOrders;
const getOrderById = async (orderId, outletId) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            customer: { select: { nama: true, nomor_telepon: true } },
            jenis_layanan: { select: { nama: true } },
            durasi_layanan: { select: { nama: true, estimasi_jam: true, harga: true } },
            parfum: { select: { nama: true, harga: true } },
            order_items: {
                include: {
                    item_layanan: { select: { nama_item: true } },
                    durasi_per_item: { select: { nama: true } },
                    jenis_per_item: { select: { nama: true } },
                },
            },
            status_logs: {
                orderBy: { created_at: "asc" },
                include: { user: { select: { nama: true, role: true } } },
            },
            payment: true,
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, outletId);
    return order;
};
exports.getOrderById = getOrderById;
const scanQR = async (qrCode, outletId) => {
    const order = await database_1.default.order.findUnique({
        where: { transaction_id: qrCode },
        include: {
            customer: { select: { nama: true, nomor_telepon: true } },
            jenis_layanan: { select: { nama: true } },
            durasi_layanan: { select: { nama: true, estimasi_jam: true, harga: true } },
            parfum: { select: { nama: true } },
            order_items: {
                include: {
                    item_layanan: { select: { nama_item: true } },
                    durasi_per_item: { select: { nama: true } },
                    jenis_per_item: { select: { nama: true } },
                },
            },
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, outletId);
    return order;
};
exports.scanQR = scanQR;
const timbangOrder = async (orderId, beratAktual, fotoTimbangan, user) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            durasi_layanan: true,
            parfum: true,
            customer: { select: { id: true, fcm_token: true } },
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, user.outletId);
    if (order.jenis_order !== "drop_and_go" && order.jenis_layanan_id) { // using jenis_layanan_id to check if per kg since items is used for per_item
        throw new error_middleware_1.AppError(400, "Timbang hanya untuk layanan per_kg");
    }
    if (order.status !== "menunggu_drop") {
        throw new error_middleware_1.AppError(400, "Order tidak dalam status menunggu_drop");
    }
    // [CRITICAL] total_harga_final calculated by backend
    const hargaPerKg = order.durasi_layanan.harga;
    const parfumHarga = order.parfum ? order.parfum.harga : new library_1.Decimal(0);
    const totalHarga = new library_1.Decimal(beratAktual).mul(hargaPerKg).add(parfumHarga);
    const updatedOrder = await database_1.default.$transaction(async (tx) => {
        const updated = await tx.order.update({
            where: { id: orderId },
            data: {
                berat_aktual: beratAktual,
                foto_timbangan: fotoTimbangan,
                total_harga_final: totalHarga,
                status: "menunggu_ditimbang",
                kasir_id: user.userId,
            },
        });
        await tx.orderStatusLog.create({
            data: {
                order_id: orderId,
                status: "menunggu_ditimbang",
                changed_by: user.userId,
                note: `Berat aktual: ${beratAktual} kg. Total: Rp ${totalHarga.toFixed(0)}`,
            },
        });
        return updated;
    });
    // Send notification to customer
    await (0, notification_util_1.createAndSendNotification)(order.customer.id, orderId, "Tagihan Laundry", `Berat: ${beratAktual}kg. Total: Rp ${totalHarga.toFixed(0)}. Silakan lakukan pembayaran.`, "tagihan", order.customer.fcm_token);
    return updatedOrder;
};
exports.timbangOrder = timbangOrder;
const updateOrderStatus = async (orderId, newStatus, note, user) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            customer: { select: { id: true, fcm_token: true } },
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, user.outletId);
    // [CRITICAL] Status must follow flow
    const allowedStatuses = STATUS_FLOW[order.status];
    if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
        throw new error_middleware_1.AppError(400, `Tidak bisa update status dari ${order.status} ke ${newStatus}`);
    }
    const updatedOrder = await database_1.default.$transaction(async (tx) => {
        const updated = await tx.order.update({
            where: { id: orderId },
            data: { status: newStatus },
        });
        await tx.orderStatusLog.create({
            data: {
                order_id: orderId,
                status: newStatus,
                changed_by: user.userId,
                note: note || null,
            },
        });
        return updated;
    });
    // Determine notification message
    const notifMessages = {
        sedang_diproses: { judul: "Laundry Diproses", pesan: "Laundry Anda sedang diproses." },
        siap_diambil: { judul: "Laundry Siap", pesan: "Laundry Anda siap diambil!" },
        selesai: { judul: "Selesai", pesan: "Terima kasih! Order Anda telah selesai." },
    };
    const notif = notifMessages[newStatus];
    if (notif) {
        await (0, notification_util_1.createAndSendNotification)(order.customer.id, orderId, notif.judul, notif.pesan, "status_order", order.customer.fcm_token);
    }
    return updatedOrder;
};
exports.updateOrderStatus = updateOrderStatus;
const createWalkinOrder = async (body, user) => {
    const outletId = user.outletId;
    // Check customer by phone
    let customer = await database_1.default.user.findUnique({
        where: { nomor_telepon: body.customer_telepon },
    });
    if (!customer) {
        // Create new customer with random password
        const randomPassword = (0, uuid_1.v4)();
        const hashedPassword = await bcryptjs_1.default.hash(randomPassword, 12);
        customer = await database_1.default.user.create({
            data: {
                nama: body.customer_nama,
                nomor_telepon: body.customer_telepon,
                password: hashedPassword,
                role: "customer",
            },
        });
    }
    const transactionId = generateTransactionId();
    const qrCode = await (0, qrcode_util_1.generateQR)(transactionId);
    // Walk-in: status starts at menunggu_ditimbang (skip menunggu_drop)
    let totalHarga = null;
    if (body.tipe_layanan === "per_kg" && body.berat_aktual) {
        const durasi = await database_1.default.durasiLayanan.findUnique({ where: { id: body.durasi_layanan_id } });
        if (!durasi)
            throw new error_middleware_1.AppError(404, "Durasi layanan tidak ditemukan");
        const parfumHarga = body.parfum_id
            ? (await database_1.default.parfum.findUnique({ where: { id: body.parfum_id } }))?.harga || new library_1.Decimal(0)
            : new library_1.Decimal(0);
        totalHarga = new library_1.Decimal(body.berat_aktual).mul(durasi.harga).add(parfumHarga);
    }
    const order = await database_1.default.$transaction(async (tx) => {
        const created = await tx.order.create({
            data: {
                transaction_id: transactionId,
                customer_id: customer.id,
                outlet_id: outletId,
                kasir_id: user.userId,
                jenis_order: "drop_and_go", // default walk in to drop_and_go? Or new field.
                jenis_layanan_id: body.jenis_layanan_id || null,
                durasi_layanan_id: body.durasi_layanan_id || null,
                parfum_id: body.parfum_id || null,
                special_notes: body.special_notes || null,
                berat_aktual: body.berat_aktual || null,
                foto_timbangan: body.foto_timbangan || null,
                total_harga_final: totalHarga,
                status: "menunggu_ditimbang",
                is_walkin: true,
                qr_code: qrCode,
            },
        });
        await tx.orderStatusLog.create({
            data: {
                order_id: created.id,
                status: "menunggu_ditimbang",
                changed_by: user.userId,
                note: "Walk-in order dibuat oleh kasir",
            },
        });
        return created;
    });
    // Send notification if customer has FCM token
    if (customer.fcm_token) {
        await (0, notification_util_1.createAndSendNotification)(customer.id, order.id, "Order Walk-in", `Pesanan walk-in Anda telah dibuat. Total: Rp ${totalHarga?.toFixed(0) || "Menunggu"}`, "tagihan", customer.fcm_token);
    }
    return order;
};
exports.createWalkinOrder = createWalkinOrder;
//# sourceMappingURL=order.service.js.map