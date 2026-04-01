import prisma from "../../../config/database";
import { AppError } from "../../../middlewares/error.middleware";
import { createMidtransPayment, checkMidtransStatus } from "../../../utils/midtrans.util";
import { createAndSendNotification } from "../../../utils/notification.util";
import { Decimal } from "@prisma/client/runtime/library";

export const getTagihan = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      outlet: { select: { nama_outlet: true } },
      jenis_layanan: { select: { nama: true } },
      durasi_layanan: { select: { nama: true, harga: true } },
      parfum: { select: { nama: true, harga: true } },
      order_items: {
        include: {
          item_layanan: { select: { nama_item: true } },
          durasi_per_item: { select: { nama: true } },
          jenis_per_item: { select: { nama: true } },
        },
      },
    },
  });

  if (!order || order.customer_id !== userId) {
    throw new AppError(404, "Order tidak ditemukan");
  }

  return {
    order_id: order.id,
    transaction_id: order.transaction_id,
    jenis_order: order.jenis_order,
    berat_aktual: order.berat_aktual,
    total_harga_final: order.total_harga_final,
    status: order.status,
    outlet: order.outlet,
    jenis_layanan: order.jenis_layanan,
    durasi_layanan: order.durasi_layanan,
    parfum: order.parfum,
    order_items: order.order_items,
  };
};

export const createPayment = async (orderId: string, userId: string, metodePembayaran: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, customer: { select: { fcm_token: true } } },
  });

  if (!order || order.customer_id !== userId) {
    throw new AppError(404, "Order tidak ditemukan");
  }

  // [CRITICAL] total_harga_final from DB, not from request
  if (!order.total_harga_final) {
    throw new AppError(400, "Total harga belum dihitung");
  }

  // Check if there's already an active pending payment
  if (order.payment && order.payment.status === "pending") {
    throw new AppError(409, "Sudah ada pembayaran aktif untuk order ini");
  }

  const amount = Number(order.total_harga_final);
  const midtransOrderId = `${order.transaction_id}-${Date.now()}`;

  // Create payment via Midtrans Core API
  const midtransResponse = await createMidtransPayment(midtransOrderId, amount, metodePembayaran);

  // Extract VA number or QRIS URL
  let vaNumber: string | null = null;
  let qrisUrl: string | null = null;

  if (midtransResponse.va_numbers && midtransResponse.va_numbers.length > 0) {
    vaNumber = midtransResponse.va_numbers[0].va_number;
  }

  if (midtransResponse.actions) {
    const qrAction = midtransResponse.actions.find((a: any) => a.name === "generate-qr-code");
    if (qrAction) {
      qrisUrl = qrAction.url;
    }
  }

  const expiredAt = midtransResponse.expiry_time ? new Date(midtransResponse.expiry_time) : null;

  // Upsert payment (delete old expired/cancelled, create new)
  if (order.payment && order.payment.status !== "pending") {
    await prisma.payment.delete({ where: { id: order.payment.id } });
  }

  const payment = await prisma.payment.create({
    data: {
      order_id: orderId,
      midtrans_order_id: midtransOrderId,
      metode_pembayaran: metodePembayaran,
      va_number: vaNumber,
      qris_url: qrisUrl,
      total_bayar: amount,
      status: "pending",
      expired_at: expiredAt,
      midtrans_response: midtransResponse as any,
    },
  });

  return payment;
};

export const getPaymentDetail = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order || order.customer_id !== userId) {
    throw new AppError(404, "Order tidak ditemukan");
  }

  if (!order.payment) {
    throw new AppError(404, "Belum ada pembayaran untuk order ini");
  }

  return order.payment;
};

export const checkPaymentStatus = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      customer: { select: { id: true, fcm_token: true } },
      outlet: { select: { id: true, saldo: true } },
    },
  });

  if (!order || order.customer_id !== userId) {
    throw new AppError(404, "Order tidak ditemukan");
  }

  if (!order.payment) {
    throw new AppError(404, "Belum ada pembayaran");
  }

  // Check status from Midtrans
  const statusResponse = await checkMidtransStatus(order.payment.midtrans_order_id);

  if (statusResponse.transaction_status === "settlement" && order.payment.status !== "settlement") {
    // Process settlement (fallback for webhook)
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: { status: "settlement", paid_at: new Date() },
      });

      // Add saldo to outlet
      const currentSaldo = order.outlet.saldo;
      const newSaldo = new Decimal(currentSaldo.toString()).add(new Decimal(order.total_harga_final!.toString()));

      await tx.outlet.update({
        where: { id: order.outlet_id },
        data: { saldo: newSaldo },
      });

      await tx.saldoLog.create({
        data: {
          outlet_id: order.outlet_id,
          tipe: "kredit",
          jumlah: order.total_harga_final!,
          saldo_sebelum: currentSaldo,
          saldo_sesudah: newSaldo,
          referensi_id: order.payment!.id,
          keterangan: `Pembayaran order ${order.transaction_id}`,
        },
      });
    });

    // Send notification
    await createAndSendNotification(
      userId,
      orderId,
      "Pembayaran Berhasil",
      "Pembayaran berhasil! Laundry sedang diproses.",
      "pembayaran",
      order.customer.fcm_token
    );
  }

  return {
    payment_status: statusResponse.transaction_status,
    order_status: order.status,
    midtrans_response: statusResponse,
  };
};
