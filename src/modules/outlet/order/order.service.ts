import prisma from "../../../config/database";
import { AppError } from "../../../middlewares/error.middleware";
import { JwtPayload } from "../../../middlewares/auth.middleware";
import { createAndSendNotification } from "../../../utils/notification.util";
import { generateQR } from "../../../utils/qrcode.util";
import { Decimal } from "@prisma/client/runtime/library";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

const generateTransactionId = (): string => {
  const date = dayjs().format("YYYYMMDD");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TRX-${date}-${result}`;
};

// [CRITICAL] Validate order belongs to outlet
const validateOutletOwnership = (order: any, outletId: string) => {
  if (order.outlet_id !== outletId) {
    throw new AppError(403, "Order bukan milik outlet Anda");
  }
};

// [CRITICAL] Valid status transitions — from AGENT_REFERENCE v3
const VALID_TRANSITIONS: Record<string, string[]> = {
  menunggu_drop:        ["menunggu_ditimbang", "dibatalkan"],
  menunggu_konfirmasi:  ["dikonfirmasi", "dibatalkan"],
  dikonfirmasi:         ["kurir_menuju", "dibatalkan"],
  kurir_menuju:         ["barang_dijemput"],
  barang_dijemput:      ["menunggu_ditimbang"],
  menunggu_ditimbang:   ["sedang_diproses", "dibatalkan"],  // kasir bebas proses tanpa cek payment
  sedang_diproses:      ["siap_diambil", "siap_diantar"],
  siap_diambil:         ["selesai"],      // ⚠️ backend WAJIB validasi payment.status === 'settlement'
  siap_diantar:         ["sedang_diantar"], // ⚠️ backend WAJIB validasi payment.status === 'settlement'
  sedang_diantar:       ["selesai"],
  selesai:              [],
  dibatalkan:           [],
};

export const getOrders = async (
  outletId: string,
  query: {
    status?: string;
    tipe_layanan?: string;
    jenis_order?: string;
    page?: number;
    limit?: number;
  }
) => {
  const where: any = { outlet_id: outletId };
  if (query.status) where.status = query.status;
  if (query.tipe_layanan) where.tipe_layanan = query.tipe_layanan;
  if (query.jenis_order) where.jenis_order = query.jenis_order;

  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: { select: { nama: true, nomor_telepon: true } },
        jenis_layanan: { select: { nama: true } },
        payment: { select: { status: true } },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrderById = async (orderId: string, outletId: string) => {
  const order = await prisma.order.findUnique({
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
      pickup: true,
    },
  });

  if (!order) throw new AppError(404, "Order tidak ditemukan");
  validateOutletOwnership(order, outletId);

  return order;
};

export const scanQR = async (qrCode: string, outletId: string) => {
  const order = await prisma.order.findUnique({
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
      payment: { select: { status: true } },
    },
  });

  if (!order) throw new AppError(404, "Order tidak ditemukan");
  validateOutletOwnership(order, outletId);

  return order;
};

export const timbangOrder = async (
  orderId: string,
  beratAktual: number,
  fotoTimbangan: string,
  user: JwtPayload
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      durasi_layanan: true,
      parfum: true,
      customer: { select: { id: true, fcm_token: true } },
    },
  });

  if (!order) throw new AppError(404, "Order tidak ditemukan");
  validateOutletOwnership(order, user.outletId!);

  // [CRITICAL] Timbang hanya untuk per_kg
  if (order.tipe_layanan !== "per_kg") {
    throw new AppError(400, "Timbang hanya untuk layanan per_kg");
  }

  if (order.status !== "menunggu_ditimbang") {
    throw new AppError(400, "Order tidak dalam status yang bisa ditimbang");
  }

  // [CRITICAL] total_harga_final calculated by backend
  const hargaPerKg = order.durasi_layanan!.harga;
  const parfumHarga = order.parfum ? order.parfum.harga : new Decimal(0);
  const totalHarga = new Decimal(beratAktual).mul(hargaPerKg).add(parfumHarga);

  const updatedOrder = await prisma.$transaction(async (tx) => {
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
  await createAndSendNotification(
    order.customer.id,
    orderId,
    "Tagihan Laundry",
    `Berat: ${beratAktual}kg. Total: Rp ${totalHarga.toFixed(0)}. Silakan lakukan pembayaran.`,
    "tagihan",
    order.customer.fcm_token
  );

  return updatedOrder;
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: string,
  note: string | undefined,
  user: JwtPayload
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, fcm_token: true } },
      payment: true,
    },
  });

  if (!order) throw new AppError(404, "Order tidak ditemukan");
  validateOutletOwnership(order, user.outletId!);

  // [CRITICAL] Status must follow valid transitions
  const allowedStatuses = VALID_TRANSITIONS[order.status];
  if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
    throw new AppError(400, `Tidak bisa update status dari ${order.status} ke ${newStatus}`);
  }

  // [CRITICAL] Gate payment — Drop & Go: siap_diambil → selesai
  if (newStatus === "selesai" && order.jenis_order === "drop_and_go") {
    if (order.payment?.status !== "settlement") {
      throw new AppError(400, "Tagihan belum dibayar. Minta customer melunasi sebelum barang diserahkan.");
    }
  }

  // [CRITICAL] Gate payment — Antar Jemput: siap_diantar → sedang_diantar
  if (newStatus === "sedang_diantar") {
    if (order.payment?.status !== "settlement") {
      throw new AppError(400, "Tagihan belum dibayar. Kurir tidak bisa dikirim sebelum customer melunasi.");
    }
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus as any },
    });

    await tx.orderStatusLog.create({
      data: {
        order_id: orderId,
        status: newStatus as any,
        changed_by: user.userId,
        note: note || null,
      },
    });

    return updated;
  });

  // Determine notification message
  const notifMessages: Record<string, { judul: string; pesan: string }> = {
    sedang_diproses: { judul: "Laundry Diproses", pesan: "Laundry Anda sedang diproses." },
    siap_diambil: { judul: "Laundry Siap", pesan: "Laundry Anda siap diambil!" },
    siap_diantar: { judul: "Laundry Siap Diantar", pesan: "Laundry Anda siap diantar!" },
    sedang_diantar: { judul: "Kurir dalam Perjalanan", pesan: "Kurir sedang dalam perjalanan mengantar laundry Anda." },
    selesai: { judul: "Selesai", pesan: "Terima kasih! Order Anda telah selesai." },
    dibatalkan: { judul: "Order Dibatalkan", pesan: "Order Anda telah dibatalkan." },
  };

  const notif = notifMessages[newStatus];
  if (notif) {
    await createAndSendNotification(
      order.customer.id,
      orderId,
      notif.judul,
      notif.pesan,
      "status_order",
      order.customer.fcm_token
    );
  }

  return updatedOrder;
};

export const createWalkinOrder = async (body: any, user: JwtPayload) => {
  const outletId = user.outletId!;

  // Check customer by phone
  let customer = await prisma.user.findUnique({
    where: { nomor_telepon: body.customer_telepon },
  });

  if (!customer) {
    // Create new customer with random password
    const randomPassword = uuidv4();
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    customer = await prisma.user.create({
      data: {
        nama: body.customer_nama,
        nomor_telepon: body.customer_telepon,
        password: hashedPassword,
        role: "customer",
      },
    });
  }

  const transactionId = generateTransactionId();
  const qrCode = await generateQR(transactionId);

  if (body.tipe_layanan === "per_kg") {
    // Walk-in Per KG
    let totalHarga: Decimal | null = null;

    if (body.berat_aktual) {
      const durasi = await prisma.durasiLayanan.findUnique({ where: { id: body.durasi_layanan_id } });
      if (!durasi) throw new AppError(404, "Durasi layanan tidak ditemukan");

      const parfumHarga = body.parfum_id
        ? (await prisma.parfum.findUnique({ where: { id: body.parfum_id } }))?.harga || new Decimal(0)
        : new Decimal(0);

      totalHarga = new Decimal(body.berat_aktual).mul(durasi.harga).add(parfumHarga);
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          transaction_id: transactionId,
          customer_id: customer!.id,
          outlet_id: outletId,
          kasir_id: user.userId,
          tipe_layanan: "per_kg",
          jenis_order: "drop_and_go",
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
      await createAndSendNotification(
        customer.id,
        order.id,
        "Order Walk-in",
        `Pesanan walk-in Anda telah dibuat. Total: Rp ${totalHarga?.toFixed(0) || "Menunggu"}`,
        "tagihan",
        customer.fcm_token
      );
    }

    return order;
  } else {
    // Walk-in Per Item
    const { items } = body;
    if (!items || items.length === 0) throw new AppError(400, "Items tidak boleh kosong untuk per_item");

    let totalHarga = new Decimal(0);
    const orderItemsData: any[] = [];

    for (const item of items) {
      const durasiPerItem = await prisma.durasiPerItem.findUnique({
        where: { id: item.durasi_per_item_id },
        include: {
          jenis_per_item: {
            include: { item_layanan: true },
          },
        },
      });

      if (!durasiPerItem || !durasiPerItem.is_active) {
        throw new AppError(404, "Durasi per item tidak ditemukan atau tidak aktif");
      }

      if (durasiPerItem.jenis_per_item.item_layanan.outlet_id !== outletId) {
        throw new AppError(400, "Item tidak milik outlet ini");
      }

      const subtotal = durasiPerItem.harga.mul(item.qty);
      totalHarga = totalHarga.add(subtotal);

      orderItemsData.push({
        item_layanan_id: durasiPerItem.jenis_per_item.item_layanan.id,
        jenis_per_item_id: durasiPerItem.jenis_per_item.id,
        durasi_per_item_id: durasiPerItem.id,
        qty: item.qty,
        harga_satuan: durasiPerItem.harga,
        subtotal,
      });
    }

    // Add parfum price
    const parfumHarga = body.parfum_id
      ? (await prisma.parfum.findUnique({ where: { id: body.parfum_id } }))?.harga || new Decimal(0)
      : new Decimal(0);
    totalHarga = totalHarga.add(parfumHarga);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          transaction_id: transactionId,
          customer_id: customer!.id,
          outlet_id: outletId,
          kasir_id: user.userId,
          tipe_layanan: "per_item",
          jenis_order: "drop_and_go",
          parfum_id: body.parfum_id || null,
          special_notes: body.special_notes || null,
          total_harga_final: totalHarga,
          status: "menunggu_ditimbang", // per_item walk-in: total langsung diketahui
          is_walkin: true,
          qr_code: qrCode,
          order_items: {
            createMany: { data: orderItemsData },
          },
        },
      });

      await tx.orderStatusLog.create({
        data: {
          order_id: created.id,
          status: "menunggu_ditimbang",
          changed_by: user.userId,
          note: "Walk-in per item order dibuat oleh kasir",
        },
      });

      return created;
    });

    if (customer.fcm_token) {
      await createAndSendNotification(
        customer.id,
        order.id,
        "Order Walk-in",
        `Pesanan walk-in Anda telah dibuat. Total: Rp ${totalHarga.toFixed(0)}`,
        "tagihan",
        customer.fcm_token
      );
    }

    return order;
  }
};

// ==================== PICKUP / ANTAR JEMPUT ====================

export const getPickupOrders = async (outletId: string) => {
  return prisma.order.findMany({
    where: {
      outlet_id: outletId,
      jenis_order: "antar_jemput",
      status: {
        in: [
          "menunggu_konfirmasi",
          "dikonfirmasi",
          "kurir_menuju",
          "barang_dijemput",
          "menunggu_ditimbang",
          "sedang_diproses",
          "siap_diantar",
          "sedang_diantar",
        ],
      },
    },
    include: {
      customer: { select: { nama: true, nomor_telepon: true } },
      pickup: true,
      payment: { select: { status: true } },
    },
    orderBy: { created_at: "desc" },
  });
};

export const konfirmasiPickup = async (orderId: string, kurirId: string, user: JwtPayload) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      pickup: true,
      customer: { select: { id: true, fcm_token: true } },
    },
  });

  if (!order) throw new AppError(404, "Order tidak ditemukan");
  validateOutletOwnership(order, user.outletId!);

  if (order.status !== "menunggu_konfirmasi") {
    throw new AppError(400, "Order tidak dalam status menunggu_konfirmasi");
  }

  // [CRITICAL] kurir_id HARUS terdaftar di OutletKasir dengan outlet_id yang sama
  const outletKasir = await prisma.outletKasir.findFirst({
    where: {
      user_id: kurirId,
      outlet_id: user.outletId!,
      is_active: true,
    },
  });
  if (!outletKasir) {
    throw new AppError(400, "Kurir tidak terdaftar atau tidak aktif di outlet ini");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.orderPickup.update({
      where: { order_id: orderId },
      data: { kurir_id: kurirId },
    });

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "dikonfirmasi" },
    });

    await tx.orderStatusLog.create({
      data: {
        order_id: orderId,
        status: "dikonfirmasi",
        changed_by: user.userId,
        note: `Dikonfirmasi, kurir ditugaskan`,
      },
    });

    return updatedOrder;
  });

  await createAndSendNotification(
    order.customer.id,
    orderId,
    "Order Dikonfirmasi",
    "Order Anda telah dikonfirmasi. Kurir akan segera menuju lokasi Anda.",
    "status_order",
    order.customer.fcm_token
  );

  return updated;
};

export const pickupBerangkat = async (orderId: string, user: JwtPayload) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      pickup: true,
      customer: { select: { id: true, fcm_token: true } },
    },
  });

  if (!order) throw new AppError(404, "Order tidak ditemukan");
  validateOutletOwnership(order, user.outletId!);

  if (order.status !== "dikonfirmasi") {
    throw new AppError(400, "Order tidak dalam status dikonfirmasi");
  }

  // [CRITICAL] Hanya kasir yang di-assign sebagai kurir yang bisa update
  if (order.pickup?.kurir_id !== user.userId) {
    throw new AppError(403, "Hanya kurir yang ditugaskan yang bisa mengupdate status ini");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "kurir_menuju" },
    });

    await tx.orderStatusLog.create({
      data: {
        order_id: orderId,
        status: "kurir_menuju",
        changed_by: user.userId,
        note: "Kurir sedang menuju lokasi",
      },
    });

    return updatedOrder;
  });

  await createAndSendNotification(
    order.customer.id,
    orderId,
    "Kurir Menuju Lokasi",
    "Kurir sedang menuju lokasi Anda untuk menjemput laundry.",
    "status_order",
    order.customer.fcm_token
  );

  return updated;
};

export const pickupDijemput = async (orderId: string, fotoBarangPickup: string, user: JwtPayload) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      pickup: true,
      customer: { select: { id: true, fcm_token: true } },
    },
  });

  if (!order) throw new AppError(404, "Order tidak ditemukan");
  validateOutletOwnership(order, user.outletId!);

  if (order.status !== "kurir_menuju") {
    throw new AppError(400, "Order tidak dalam status kurir_menuju");
  }

  // [CRITICAL] foto_barang_pickup WAJIB
  if (!fotoBarangPickup) {
    throw new AppError(400, "Foto barang pickup WAJIB disertakan");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.orderPickup.update({
      where: { order_id: orderId },
      data: { foto_barang_pickup: fotoBarangPickup },
    });

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "barang_dijemput" },
    });

    await tx.orderStatusLog.create({
      data: {
        order_id: orderId,
        status: "barang_dijemput",
        changed_by: user.userId,
        note: "Barang telah dijemput",
      },
    });

    return updatedOrder;
  });

  await createAndSendNotification(
    order.customer.id,
    orderId,
    "Barang Dijemput",
    "Barang laundry Anda telah dijemput oleh kurir.",
    "status_order",
    order.customer.fcm_token
  );

  return updated;
};

export const pickupDiantar = async (orderId: string, user: JwtPayload) => {
  // This handles siap_diantar → sedang_diantar (same as updateOrderStatus with gate payment)
  return updateOrderStatus(orderId, "sedang_diantar", "Kurir sedang mengantar laundry", user);
};

export const pickupSelesaiAntar = async (orderId: string, user: JwtPayload) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, fcm_token: true } },
    },
  });

  if (!order) throw new AppError(404, "Order tidak ditemukan");
  validateOutletOwnership(order, user.outletId!);

  if (order.status !== "sedang_diantar") {
    throw new AppError(400, "Order tidak dalam status sedang_diantar");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "selesai" },
    });

    await tx.orderStatusLog.create({
      data: {
        order_id: orderId,
        status: "selesai",
        changed_by: user.userId,
        note: "Laundry telah diterima oleh customer",
      },
    });

    return updatedOrder;
  });

  await createAndSendNotification(
    order.customer.id,
    orderId,
    "Selesai",
    "Terima kasih! Order Anda telah selesai.",
    "status_order",
    order.customer.fcm_token
  );

  return updated;
};
