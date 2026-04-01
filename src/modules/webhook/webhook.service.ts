import prisma from "../../config/database";
import { Prisma } from "@prisma/client";
import { AppError } from "../../middlewares/error.middleware";
import { verifyMidtransSignature } from "../../utils/midtrans.util";
import { createAndSendNotification } from "../../utils/notification.util";
import { Decimal } from "@prisma/client/runtime/library";
import logger from "../../utils/logger";

export const handleMidtransWebhook = async (payload: any) => {
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
  } = payload;

  // [CRITICAL] Verify signature before processing
  const expectedSignature = verifyMidtransSignature(order_id, status_code, gross_amount);
  if (signature_key !== expectedSignature) {
    throw new AppError(403, "Signature tidak valid");
  }

  // Find payment by midtrans_order_id
  const payment = await prisma.payment.findUnique({
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
    logger.warn(`Webhook: Payment not found for order_id ${order_id}`);
    return { status: "ok", message: "Payment not found" };
  }

  if (transaction_status === "settlement") {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
      const totalHarga = payment.order.total_harga_final!;
      const newSaldo = new Decimal(currentSaldo.toString()).add(new Decimal(totalHarga.toString()));

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
    await createAndSendNotification(
      payment.order.customer.id,
      payment.order.id,
      "Pembayaran Berhasil",
      "Pembayaran berhasil! Laundry sedang diproses.",
      "pembayaran",
      payment.order.customer.fcm_token
    );
  } else if (transaction_status === "expire") {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "expire", midtrans_response: payload },
      });
    });

    await createAndSendNotification(
      payment.order.customer.id,
      payment.order.id,
      "Pembayaran Expired",
      "Pembayaran expired. Silakan buat order baru.",
      "pembayaran",
      payment.order.customer.fcm_token
    );
  } else if (transaction_status === "cancel" || transaction_status === "deny") {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: transaction_status as any, midtrans_response: payload },
      });
    });

    await createAndSendNotification(
      payment.order.customer.id,
      payment.order.id,
      "Pembayaran Dibatalkan",
      `Pembayaran dibatalkan (${transaction_status}).`,
      "pembayaran",
      payment.order.customer.fcm_token
    );
  }

  return { status: "ok" };
};
