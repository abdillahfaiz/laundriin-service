import prisma from "../../../config/database";
import { AppError } from "../../../middlewares/error.middleware";
import { HariEnum } from "@prisma/client";

export const getProfile = async (outletId: string) => {
  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId },
    include: {
      admin: { select: { nama: true, nomor_telepon: true } },
    },
  });

  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");
  return outlet;
};

export const updateProfile = async (outletId: string, data: any) => {
  return prisma.outlet.update({
    where: { id: outletId },
    data: {
      nama_outlet: data.nama_outlet,
      alamat: data.alamat,
      foto_outlet: data.foto_outlet,
      lat: data.lat,
      lng: data.lng,
    },
  });
};

export const getOperasional = async (outletId: string) => {
  return prisma.outletOperasional.findMany({
    where: { outlet_id: outletId },
    orderBy: { hari: "asc" },
  });
};

export const updateOperasional = async (outletId: string, data: any[]) => {
  const results = [];
  for (const item of data) {
    const result = await prisma.outletOperasional.upsert({
      where: {
        outlet_id_hari: {
          outlet_id: outletId,
          hari: item.hari as HariEnum,
        },
      },
      create: {
        outlet_id: outletId,
        hari: item.hari,
        jam_buka: item.jam_buka,
        jam_tutup: item.jam_tutup,
        is_open: item.is_open,
      },
      update: {
        jam_buka: item.jam_buka,
        jam_tutup: item.jam_tutup,
        is_open: item.is_open,
      },
    });
    results.push(result);
  }
  return results;
};

// ==================== COVERAGE ====================
export const getCoverages = async (outletId: string) => {
  return prisma.outletCoverage.findMany({
    where: { outlet_id: outletId },
    orderBy: { max_radius_km: "asc" },
  });
};

export const createCoverage = async (outletId: string, data: any) => {
  return prisma.outletCoverage.create({
    data: {
      outlet_id: outletId,
      nama_area: data.nama_area,
      max_radius_km: data.max_radius_km,
      ongkos_kirim: data.ongkos_kirim,
    },
  });
};

export const updateCoverage = async (id: string, outletId: string, data: any) => {
  const existing = await prisma.outletCoverage.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) {
    throw new AppError(404, "Coverage tidak ditemukan");
  }

  return prisma.outletCoverage.update({
    where: { id },
    data: {
      nama_area: data.nama_area,
      max_radius_km: data.max_radius_km,
      ongkos_kirim: data.ongkos_kirim,
      is_active: data.is_active,
    },
  });
};

export const deleteCoverage = async (id: string, outletId: string) => {
  const existing = await prisma.outletCoverage.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) {
    throw new AppError(404, "Coverage tidak ditemukan");
  }

  return prisma.outletCoverage.delete({ where: { id } });
};
