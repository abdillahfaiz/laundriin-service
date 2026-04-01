"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMidtransWebhook = void 0;
const database_1 = __importDefault(require("../../config/database"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const midtrans_util_1 = require("../../utils/midtrans.util");
const notification_util_1 = require("../../utils/notification.util");
const library_1 = require("@prisma/client/runtime/library");
const logger_1 = __importDefault(require("../../utils/logger"));
const handleMidtransWebhook = async (payload) => {
    const { order_id, status_code, gross_amount, signature_key, transaction_status, } = payload;
    // [CRITICAL] Verify signature before processing
    const expectedSignature = (0, midtrans_util_1.verifyMidtransSignature)(order_id, status_code, gross_amount);
    if (signature_key !== expectedSignature) {
        throw new error_middleware_1.AppError(403, "Signature tidak valid");
    }
    // Find payment by midtrans_order_id
    const payment = await database_1.default.payment.findUnique({
        where: { midtrans_order_id: order_id },
        include: {
            order: {
                include: {
                    customer: { select: { id: true, fcm_token: true } },
                    outlet: { select: { id: true, saldo: true } },
                },
            },
        },
    });
    if (!payment) {
        logger_1.default.warn(`Webhook: Payment not found for order_id ${order_id}`);
        return { status: "ok", message: "Payment not found" };
    }
    if (transaction_status === "settlement") {
        await database_1.default.$transaction(async (tx) => {
            // 1. Update payment status
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: "settlement",
                    paid_at: new Date(),
                    midtrans_response: payload,
                },
            });
            // 4. Add saldo to outlet
            const currentSaldo = payment.order.outlet.saldo;
            const totalHarga = payment.order.total_harga_final;
            const newSaldo = new library_1.Decimal(currentSaldo.toString()).add(new library_1.Decimal(totalHarga.toString()));
            await tx.outlet.update({
                where: { id: payment.order.outlet.id },
                data: { saldo: newSaldo },
            });
            // 5. Log saldo change
            await tx.saldoLog.create({
                data: {
                    outlet_id: payment.order.outlet.id,
                    tipe: "kredit",
                    jumlah: totalHarga,
                    saldo_sebelum: currentSaldo,
                    saldo_sesudah: newSaldo,
                    referensi_id: payment.id,
                    keterangan: `Pembayaran order ${payment.order.transaction_id}`,
                },
            });
        });
        // 6. Push notification
        await (0, notification_util_1.createAndSendNotification)(payment.order.customer.id, payment.order.id, "Pembayaran Berhasil", "Pembayaran berhasil! Laundry sedang diproses.", "pembayaran", payment.order.customer.fcm_token);
    }
    else if (transaction_status === "expire") {
        await database_1.default.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: payment.id },
                data: { status: "expire", midtrans_response: payload },
            });
        });
        await (0, notification_util_1.createAndSendNotification)(payment.order.customer.id, payment.order.id, "Pembayaran Expired", "Pembayaran expired. Silakan buat order baru.", "pembayaran", payment.order.customer.fcm_token);
    }
    else if (transaction_status === "cancel" || transaction_status === "deny") {
        await database_1.default.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: payment.id },
                data: { status: transaction_status, midtrans_response: payload },
            });
        });
        await (0, notification_util_1.createAndSendNotification)(payment.order.customer.id, payment.order.id, "Pembayaran Dibatalkan", `Pembayaran dibatalkan (${transaction_status}).`, "pembayaran", payment.order.customer.fcm_token);
    }
    return { status: "ok" };
};
exports.handleMidtransWebhook = handleMidtransWebhook;
//# sourceMappingURL=webhook.service.js.map