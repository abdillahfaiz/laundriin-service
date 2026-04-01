import prisma from "../../../config/database";
import { OrderStatus } from "@prisma/client";
import { AppError } from "../../../middlewares/error.middleware";
import { JwtPayload } from "../../../middlewares/auth.middleware";
import { generateQR } from "../../../utils/qrcode.util";
import { haversine } from "../../../utils/haversine.util";
import dayjs from "dayjs";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Generate transaction ID: TRX-{YYYYMMDD}-{6 chars alphanumeric uppercase}
 */
const generateTransactionId = (): string => {
  const date = dayjs().format("YYYYMMDD");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TRX-${date}-${result}`;
};

/**
 * Validate jadwal jemput — minimum 2 jam dari sekarang, tidak boleh masa lampau
 */
const validateJadwal = (jadwalJemput: Date): void => {
  const now = new Date();
  const minJadwal = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 jam

  if (jadwalJemput < now) throw new AppError(400, "Jadwal tidak boleh di masa lampau");
  if (jadwalJemput < minJadwal) throw new AppError(400, "Jadwal minimal 2 jam dari sekarang");
};

/**
 * Get coverage and ongkos_kirim — ambil yang termurah jika multiple coverage
 */
const getCoverage = async (outletId: string, customerLat: number, customerLng: number) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");

  const coverages = await prisma.outletCoverage.findMany({
    where: { outlet_id: outletId, is_active: true },
  });

  const validCoverages = coverages.filter((c) => {
    const dist = haversine(Number(outlet.lat), Number(outlet.lng), customerLat, customerLng);
    return dist <= c.max_radius_km;
  });

  if (validCoverages.length === 0) throw new AppError(400, "Lokasi di luar jangkauan antar jemput outlet ini");

  // Ambil yang termurah
  return validCoverages.sort((a, b) => Number(a.ongkos_kirim) - Number(b.ongkos_kirim))[0];
};

export const createOrder = async (body: any, user: JwtPayload) => {
  const { outlet_id, tipe_layanan, jenis_order, parfum_id, special_notes } = body;

  // Validate outlet exists and is active
  const outlet = await prisma.outlet.findUnique({ where: { id: outlet_id } });
  if (!outlet || outlet.status !== "aktif") {
    throw new AppError(404, "Outlet tidak ditemukan atau sedang nonaktif");
  }

  // Validate parfum if provided
  let parfumHarga = new Decimal(0);
  if (parfum_id) {
    const parfum = await prisma.parfum.findUnique({ where: { id: parfum_id } });
    if (!parfum || !parfum.is_active) throw new AppError(404, "Parfum tidak ditemukan");
    parfumHarga = parfum.harga;
  }

  // Validate pickup data for antar_jemput
  let pickupData: any = null;
  let ongkosKirim = new Decimal(0);

  if (jenis_order === "antar_jemput") {
    if (!body.pickup) {
      throw new AppError(400, "Data pickup wajib diisi untuk order antar jemput");
    }

    const { alamat_pickup, lat_pickup, lng_pickup, jadwal_jemput, alamat_antar, lat_antar, lng_antar, catatan_alamat } = body.pickup;

    // Validate jadwal
    validateJadwal(new Date(jadwal_jemput));

    // Get coverage and lock ongkos_kirim
    const coverage = await getCoverage(outlet_id, lat_pickup, lng_pickup);
    ongkosKirim = coverage.ongkos_kirim;

    pickupData = {
      alamat_pickup,
      lat_pickup,
      lng_pickup,
      alamat_antar: alamat_antar || alamat_pickup, // default = alamat_pickup
      lat_antar: lat_antar || lat_pickup,
      lng_antar: lng_antar || lng_pickup,
      jadwal_jemput: new Date(jadwal_jemput),
      ongkos_kirim: ongkosKirim,
      catatan_alamat: catatan_alamat || null,
    };
  }

  const transactionId = generateTransactionId();
  const qrCode = await generateQR(transactionId);

  // Determine initial status
  const initialStatus = jenis_order === "antar_jemput"
    ? OrderStatus.menunggu_konfirmasi
    : OrderStatus.menunggu_drop;

  if (tipe_layanan === "per_kg") {
    const { jenis_layanan_id, durasi_layanan_id } = body;

    // Validate jenis layanan
    const jenisLayanan = await prisma.jenisLayanan.findUnique({ where: { id: jenis_layanan_id } });
    if (!jenisLayanan || !jenisLayanan.is_active || jenisLayanan.outlet_id !== outlet_id) {
      throw new AppError(404, "Jenis layanan tidak ditemukan");
    }

    // Validate durasi
    const durasiLayanan = await prisma.durasiLayanan.findUnique({ where: { id: durasi_layanan_id } });
    if (!durasiLayanan || !durasiLayanan.is_active || durasiLayanan.jenis_layanan_id !== jenis_layanan_id) {
      throw new AppError(404, "Durasi layanan tidak ditemukan");
    }

    // For per_kg: total_harga_final computed when kasir inputs weight
    const order = await prisma.order.create({
      data: {
        transaction_id: transactionId,
        customer_id: user.userId,
        outlet_id,
        tipe_layanan: "per_kg",
        jenis_order: jenis_order || "drop_and_go",
        jenis_layanan_id,
        durasi_layanan_id,
        parfum_id: parfum_id || null,
        special_notes: special_notes || null,
        status: initialStatus,
        qr_code: qrCode,
        status_logs: {
          create: {
            status: initialStatus,
            changed_by: user.userId,
            note: "Order dibuat oleh customer",
          },
        },
        ...(pickupData ? { pickup: { create: pickupData } } : {}),
      },
      include: {
        jenis_layanan: { select: { nama: true } },
        durasi_layanan: { select: { nama: true, estimasi_jam: true, harga: true } },
        parfum: { select: { nama: true, harga: true } },
        outlet: { select: { nama_outlet: true } },
        pickup: true,
      },
    });

    return order;
  } else {
    // per_item
    const { items } = body;

    // Validate and calculate each item
    let totalHarga = new Decimal(0);
    const orderItemsData: any[] = [];

    for (const item of items) {
      // Find the specific DurasiPerItem, which includes JenisPerItem and ItemLayanan
      const durasiPerItem = await prisma.durasiPerItem.findUnique({
        where: { id: item.durasi_per_item_id },
        include: {
          jenis_per_item: {
            include: { item_layanan: true }
          }
        }
      });

      if (!durasiPerItem || !durasiPerItem.is_active || !durasiPerItem.jenis_per_item.is_active || !durasiPerItem.jenis_per_item.item_layanan.is_active) {
        throw new AppError(404, `Harga item layanan tidak ditemukan atau tidak aktif`);
      }

      if (durasiPerItem.jenis_per_item.item_layanan.outlet_id !== outlet_id) {
        throw new AppError(400, "Item tidak milik outlet ini");
      }

      // Validate jenis_per_item_id matches
      if (durasiPerItem.jenis_per_item_id !== item.jenis_per_item_id) {
        throw new AppError(400, "Durasi tidak cocok dengan jenis per item yang dipilih");
      }

      const subtotal = durasiPerItem.harga.mul(item.qty);
      totalHarga = totalHarga.add(subtotal);

      orderItemsData.push({
        item_layanan_id: durasiPerItem.jenis_per_item.item_layanan.id,
        jenis_per_item_id: durasiPerItem.jenis_per_item.id,
        durasi_per_item_id: durasiPerItem.id,
        qty: item.qty,
        harga_satuan: durasiPerItem.harga,  // snapshot harga saat order
        subtotal,
      });
    }

    // Add parfum price + ongkos kirim
    totalHarga = totalHarga.add(parfumHarga).add(ongkosKirim);

    // For per_item: total_harga_final is known immediately
    // Walk-in per item: status langsung `menunggu_ditimbang` (tidak perlu timbang fisik)
    const perItemStatus = jenis_order === "antar_jemput"
      ? OrderStatus.menunggu_konfirmasi
      : OrderStatus.menunggu_drop;

    const order = await prisma.order.create({
      data: {
        transaction_id: transactionId,
        customer_id: user.userId,
        outlet_id,
        tipe_layanan: "per_item",
        jenis_order: jenis_order || "drop_and_go",
        parfum_id: parfum_id || null,
        special_notes: special_notes || null,
        total_harga_final: totalHarga,
        status: perItemStatus,
        qr_code: qrCode,
        order_items: {
          createMany: { data: orderItemsData },
        },
        status_logs: {
          create: {
            status: perItemStatus,
            changed_by: user.userId,
            note: "Order dibuat oleh customer",
          },
        },
        ...(pickupData ? { pickup: { create: pickupData } } : {}),
      },
      include: {
        order_items: {
          include: {
            item_layanan: { select: { nama_item: true } },
            jenis_per_item: { select: { nama: true } },
            durasi_per_item: { select: { nama: true, estimasi_jam: true } },
          },
        },
        parfum: { select: { nama: true, harga: true } },
        outlet: { select: { nama_outlet: true } },
        pickup: true,
      },
    });

    return order;
  }
};

export const getActiveOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      customer_id: userId,
      status: {
        in: [
          // Drop & Go statuses
          OrderStatus.menunggu_drop,
          OrderStatus.menunggu_ditimbang,
          OrderStatus.sedang_diproses,
          OrderStatus.siap_diambil,
          // Antar Jemput statuses
          OrderStatus.menunggu_konfirmasi,
          OrderStatus.dikonfirmasi,
          OrderStatus.kurir_menuju,
          OrderStatus.barang_dijemput,
          OrderStatus.siap_diantar,
          OrderStatus.sedang_diantar,
        ],
      },
    },
    include: {
      outlet: { select: { nama_outlet: true } },
      jenis_layanan: { select: { nama: true } },
      payment: { select: { status: true } },
      pickup: { select: { jadwal_jemput: true, alamat_pickup: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return orders;
};

export const getOrderHistory = async (userId: string, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: {
        customer_id: userId,
        status: { in: [OrderStatus.selesai, OrderStatus.dibatalkan] },
      },
      include: {
        outlet: { select: { nama_outlet: true } },
        jenis_layanan: { select: { nama: true } },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({
      where: {
        customer_id: userId,
        status: { in: [OrderStatus.selesai, OrderStatus.dibatalkan] },
      },
    }),
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

export const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      outlet: { select: { nama_outlet: true, alamat: true } },
      jenis_layanan: { select: { nama: true } },
      durasi_layanan: { select: { nama: true, estimasi_jam: true, harga: true } },
      parfum: { select: { nama: true, harga: true } },
      order_items: {
        include: {
          item_layanan: { select: { nama_item: true } },
          jenis_per_item: { select: { nama: true } },
          durasi_per_item: { select: { nama: true, estimasi_jam: true } },
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

  if (!order || order.customer_id !== userId) {
    throw new AppError(404, "Order tidak ditemukan");
  }

  return order;
};

export const getOrderQR = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      transaction_id: true,
      qr_code: true,
      customer_id: true,
    },
  });

  if (!order || order.customer_id !== userId) {
    throw new AppError(404, "Order tidak ditemukan");
  }

  return {
    transaction_id: order.transaction_id,
    qr_code: order.qr_code,
  };
};
