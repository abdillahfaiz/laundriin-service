import prisma from "../../../config/database";
import { AppError } from "../../../middlewares/error.middleware";
import { haversine } from "../../../utils/haversine.util";
import dayjs from "dayjs";

const HARI_MAP: Record<number, string> = {
  0: "minggu",
  1: "senin",
  2: "selasa",
  3: "rabu",
  4: "kamis",
  5: "jumat",
  6: "sabtu",
};

const checkIsOpen = (operasional: any[]): boolean => {
  const now = dayjs();
  const hariIni = HARI_MAP[now.day()];
  const ops = operasional.find((o: any) => o.hari === hariIni);
  if (!ops || !ops.is_open) return false;

  const currentTime = now.format("HH:mm");
  return currentTime >= ops.jam_buka && currentTime <= ops.jam_tutup;
};

export const getNearbyOutlets = async (lat: number, lng: number, radius: number, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const outlets = await prisma.outlet.findMany({
    where: { status: "aktif" },
    include: { operasional: true },
  });

  const allNearby = outlets
    .map((outlet) => {
      const jarak_km = haversine(lat, lng, Number(outlet.lat), Number(outlet.lng));
      return {
        id: outlet.id,
        nama_outlet: outlet.nama_outlet,
        alamat: outlet.alamat,
        foto_outlet: outlet.foto_outlet,
        lat: outlet.lat,
        lng: outlet.lng,
        jarak_km,
        is_buka: checkIsOpen(outlet.operasional),
        operasional: outlet.operasional,
      };
    })
    .filter((o) => o.jarak_km <= radius)
    .sort((a, b) => a.jarak_km - b.jarak_km);

  const paginatedData = allNearby.slice(skip, skip + limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: allNearby.length,
      totalPages: Math.ceil(allNearby.length / limit),
    },
  };
};

export const getOutletById = async (outletId: string) => {
  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId, status: "aktif" },
    include: { operasional: { orderBy: { hari: "asc" } } },
  });

  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");

  return { ...outlet, is_buka: checkIsOpen(outlet.operasional) };
};

// ==================== PER KG ====================
export const getLayananPerKg = async (outletId: string) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId, status: "aktif" } });
  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");

  return prisma.jenisLayanan.findMany({
    where: { outlet_id: outletId, is_active: true },
    select: { id: true, nama: true, deskripsi: true },
  });
};

export const getDurasiPerKg = async (outletId: string, jenisLayananId: string) => {
  const jenis = await prisma.jenisLayanan.findUnique({ where: { id: jenisLayananId } });
  if (!jenis || jenis.outlet_id !== outletId || !jenis.is_active) {
    throw new AppError(404, "Jenis layanan tidak ditemukan");
  }

  return prisma.durasiLayanan.findMany({
    where: { jenis_layanan_id: jenisLayananId, is_active: true },
    select: { id: true, nama: true, estimasi_jam: true, harga: true },
    orderBy: { estimasi_jam: "asc" },
  });
};

// ==================== PER ITEM ====================
export const getItemsPerItem = async (outletId: string) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId, status: "aktif" } });
  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");

  return prisma.itemLayanan.findMany({
    where: { outlet_id: outletId, is_active: true },
    select: { id: true, nama_item: true, foto_item: true },
  });
};

export const getJenisPerItem = async (outletId: string, itemId: string) => {
  const item = await prisma.itemLayanan.findUnique({ where: { id: itemId } });
  if (!item || item.outlet_id !== outletId || !item.is_active) {
    throw new AppError(404, "Item tidak ditemukan");
  }

  return prisma.jenisPerItem.findMany({
    where: { item_layanan_id: itemId, is_active: true },
    select: { id: true, nama: true, deskripsi: true },
  });
};

export const getDurasiPerItem = async (outletId: string, jenisId: string) => {
  const jenis = await prisma.jenisPerItem.findUnique({
    where: { id: jenisId },
    include: { item_layanan: true },
  });
  if (!jenis || jenis.item_layanan.outlet_id !== outletId || !jenis.is_active) {
    throw new AppError(404, "Jenis per item tidak ditemukan");
  }

  return prisma.durasiPerItem.findMany({
    where: { jenis_per_item_id: jenisId, is_active: true },
    select: { id: true, nama: true, estimasi_jam: true, harga: true },
    orderBy: { estimasi_jam: "asc" },
  });
};

// ==================== PARFUM ====================
export const getParfumByOutlet = async (outletId: string) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId, status: "aktif" } });
  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");

  return prisma.parfum.findMany({
    where: { outlet_id: outletId, is_active: true },
    select: { id: true, nama: true, harga: true },
  });
};

// ==================== COVERAGE ====================
export const getCoverage = async (outletId: string, lat: number, lng: number) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId, status: "aktif" } });
  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");

  const jarak_km = haversine(Number(outlet.lat), Number(outlet.lng), lat, lng);

  const coverages = await prisma.outletCoverage.findMany({
    where: { outlet_id: outletId, is_active: true },
  });

  const validCoverages = coverages.filter((c) => jarak_km <= c.max_radius_km);

  if (validCoverages.length === 0) {
    return {
      is_covered: false,
      jarak_km,
      coverage: null,
      message: "Lokasi di luar jangkauan antar jemput outlet ini",
    };
  }

  // Termurah
  const termurah = validCoverages.sort((a, b) => Number(a.ongkos_kirim) - Number(b.ongkos_kirim))[0];

  return {
    is_covered: true,
    jarak_km,
    coverage: termurah,
  };
};
