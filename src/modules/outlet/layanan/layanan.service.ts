import prisma from "../../../config/database";
import { AppError } from "../../../middlewares/error.middleware";

// ========== JENIS LAYANAN (Per KG) ==========
export const getJenisLayanan = async (outletId: string) => {
  return prisma.jenisLayanan.findMany({
    where: { outlet_id: outletId },
    orderBy: { created_at: "desc" },
  });
};

export const createJenisLayanan = async (outletId: string, data: any) => {
  return prisma.jenisLayanan.create({
    data: { outlet_id: outletId, nama: data.nama, deskripsi: data.deskripsi },
  });
};

export const updateJenisLayanan = async (id: string, outletId: string, data: any) => {
  const existing = await prisma.jenisLayanan.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) throw new AppError(404, "Jenis layanan tidak ditemukan");

  return prisma.jenisLayanan.update({ where: { id }, data });
};

export const toggleJenisLayanan = async (id: string, outletId: string) => {
  const existing = await prisma.jenisLayanan.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) throw new AppError(404, "Jenis layanan tidak ditemukan");

  return prisma.jenisLayanan.update({ where: { id }, data: { is_active: !existing.is_active } });
};

export const deleteJenisLayanan = async (id: string, outletId: string) => {
  const existing = await prisma.jenisLayanan.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) throw new AppError(404, "Jenis layanan tidak ditemukan");

  // Soft delete
  return prisma.jenisLayanan.update({ where: { id }, data: { is_active: false } });
};

// ========== DURASI LAYANAN (Per KG) ==========
// NOTE: DurasiLayanan no longer has outlet_id — ownership checked via jenis_layanan.outlet_id
export const getDurasiLayanan = async (jenisLayananId: string, outletId: string) => {
  // Verify jenis_layanan belongs to outlet
  const jenis = await prisma.jenisLayanan.findUnique({ where: { id: jenisLayananId } });
  if (!jenis || jenis.outlet_id !== outletId) throw new AppError(404, "Jenis layanan tidak ditemukan");

  return prisma.durasiLayanan.findMany({
    where: { jenis_layanan_id: jenisLayananId },
    orderBy: { estimasi_jam: "asc" },
  });
};

export const createDurasiLayanan = async (jenisLayananId: string, outletId: string, data: any) => {
  // Validate jenis layanan belongs to outlet
  const jenis = await prisma.jenisLayanan.findUnique({ where: { id: jenisLayananId } });
  if (!jenis || jenis.outlet_id !== outletId) throw new AppError(404, "Jenis layanan tidak ditemukan");

  return prisma.durasiLayanan.create({
    data: {
      jenis_layanan_id: jenisLayananId,
      nama: data.nama,
      estimasi_jam: data.estimasi_jam,
      harga: data.harga,
    },
  });
};

export const updateDurasiLayanan = async (id: string, outletId: string, data: any) => {
  const existing = await prisma.durasiLayanan.findUnique({
    where: { id },
    include: { jenis_layanan: true },
  });
  if (!existing || existing.jenis_layanan.outlet_id !== outletId) throw new AppError(404, "Durasi layanan tidak ditemukan");

  return prisma.durasiLayanan.update({ where: { id }, data });
};

export const toggleDurasiLayanan = async (id: string, outletId: string) => {
  const existing = await prisma.durasiLayanan.findUnique({
    where: { id },
    include: { jenis_layanan: true },
  });
  if (!existing || existing.jenis_layanan.outlet_id !== outletId) throw new AppError(404, "Durasi layanan tidak ditemukan");

  return prisma.durasiLayanan.update({ where: { id }, data: { is_active: !existing.is_active } });
};

export const deleteDurasiLayanan = async (id: string, outletId: string) => {
  const existing = await prisma.durasiLayanan.findUnique({
    where: { id },
    include: { jenis_layanan: true },
  });
  if (!existing || existing.jenis_layanan.outlet_id !== outletId) throw new AppError(404, "Durasi layanan tidak ditemukan");

  return prisma.durasiLayanan.update({ where: { id }, data: { is_active: false } });
};

// ========== ITEM LAYANAN ==========
export const getItemLayanan = async (outletId: string) => {
  return prisma.itemLayanan.findMany({
    where: { outlet_id: outletId },
    orderBy: { created_at: "desc" },
  });
};

export const createItemLayanan = async (outletId: string, data: any) => {
  return prisma.itemLayanan.create({
    data: { outlet_id: outletId, nama_item: data.nama_item, foto_item: data.foto_item },
  });
};

export const updateItemLayanan = async (id: string, outletId: string, data: any) => {
  const existing = await prisma.itemLayanan.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) throw new AppError(404, "Item layanan tidak ditemukan");

  return prisma.itemLayanan.update({ where: { id }, data });
};

export const toggleItemLayanan = async (id: string, outletId: string) => {
  const existing = await prisma.itemLayanan.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) throw new AppError(404, "Item layanan tidak ditemukan");

  return prisma.itemLayanan.update({ where: { id }, data: { is_active: !existing.is_active } });
};

export const deleteItemLayanan = async (id: string, outletId: string) => {
  const existing = await prisma.itemLayanan.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) throw new AppError(404, "Item layanan tidak ditemukan");

  return prisma.itemLayanan.update({ where: { id }, data: { is_active: false } });
};

// ========== PARFUM ==========
export const getParfum = async (outletId: string) => {
  return prisma.parfum.findMany({
    where: { outlet_id: outletId },
    orderBy: { nama: "asc" },
  });
};

export const createParfum = async (outletId: string, data: any) => {
  return prisma.parfum.create({
    data: { outlet_id: outletId, nama: data.nama, harga: data.harga },
  });
};

export const updateParfum = async (id: string, outletId: string, data: any) => {
  const existing = await prisma.parfum.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) throw new AppError(404, "Parfum tidak ditemukan");

  return prisma.parfum.update({ where: { id }, data });
};

export const toggleParfum = async (id: string, outletId: string) => {
  const existing = await prisma.parfum.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) throw new AppError(404, "Parfum tidak ditemukan");

  return prisma.parfum.update({ where: { id }, data: { is_active: !existing.is_active } });
};

export const deleteParfum = async (id: string, outletId: string) => {
  const existing = await prisma.parfum.findUnique({ where: { id } });
  if (!existing || existing.outlet_id !== outletId) throw new AppError(404, "Parfum tidak ditemukan");

  return prisma.parfum.update({ where: { id }, data: { is_active: false } });
};

// ========== JENIS PER ITEM ==========
export const getJenisPerItem = async (itemId: string, outletId: string) => {
  const item = await prisma.itemLayanan.findUnique({ where: { id: itemId } });
  if (!item || item.outlet_id !== outletId) throw new AppError(404, "Item layanan tidak ditemukan");

  return prisma.jenisPerItem.findMany({
    where: { item_layanan_id: itemId },
    orderBy: { created_at: "desc" },
  });
};

export const createJenisPerItem = async (itemId: string, outletId: string, data: any) => {
  const item = await prisma.itemLayanan.findUnique({ where: { id: itemId } });
  if (!item || item.outlet_id !== outletId) throw new AppError(404, "Item layanan tidak ditemukan");

  return prisma.jenisPerItem.create({
    data: { item_layanan_id: itemId, nama: data.nama, deskripsi: data.deskripsi },
  });
};

export const updateJenisPerItem = async (id: string, outletId: string, data: any) => {
  const existing = await prisma.jenisPerItem.findUnique({
    where: { id },
    include: { item_layanan: true }
  });
  if (!existing || existing.item_layanan.outlet_id !== outletId) throw new AppError(404, "Jenis layanan per item tidak ditemukan");

  return prisma.jenisPerItem.update({ where: { id }, data });
};

export const toggleJenisPerItem = async (id: string, outletId: string) => {
  const existing = await prisma.jenisPerItem.findUnique({
    where: { id },
    include: { item_layanan: true }
  });
  if (!existing || existing.item_layanan.outlet_id !== outletId) throw new AppError(404, "Jenis layanan per item tidak ditemukan");

  return prisma.jenisPerItem.update({ where: { id }, data: { is_active: !existing.is_active } });
};

export const deleteJenisPerItem = async (id: string, outletId: string) => {
  const existing = await prisma.jenisPerItem.findUnique({
    where: { id },
    include: { item_layanan: true }
  });
  if (!existing || existing.item_layanan.outlet_id !== outletId) throw new AppError(404, "Jenis layanan per item tidak ditemukan");

  return prisma.jenisPerItem.delete({ where: { id } });
};


// ========== DURASI PER ITEM ==========
export const getDurasiPerItem = async (jenisId: string, outletId: string) => {
  const jenis = await prisma.jenisPerItem.findUnique({ 
    where: { id: jenisId },
    include: { item_layanan: true }
  });
  if (!jenis || jenis.item_layanan.outlet_id !== outletId) throw new AppError(404, "Jenis per item tidak ditemukan");

  return prisma.durasiPerItem.findMany({
    where: { jenis_per_item_id: jenisId },
    orderBy: { estimasi_jam: "asc" },
  });
};

export const createDurasiPerItem = async (jenisId: string, outletId: string, data: any) => {
  const jenis = await prisma.jenisPerItem.findUnique({ 
    where: { id: jenisId },
    include: { item_layanan: true }
  });
  if (!jenis || jenis.item_layanan.outlet_id !== outletId) throw new AppError(404, "Jenis per item tidak ditemukan");

  return prisma.durasiPerItem.create({
    data: { jenis_per_item_id: jenisId, nama: data.nama, estimasi_jam: data.estimasi_jam, harga: data.harga },
  });
};

export const updateDurasiPerItem = async (id: string, outletId: string, data: any) => {
  const existing = await prisma.durasiPerItem.findUnique({
    where: { id },
    include: { jenis_per_item: { include: { item_layanan: true } } }
  });
  if (!existing || existing.jenis_per_item.item_layanan.outlet_id !== outletId) throw new AppError(404, "Durasi per item tidak ditemukan");

  return prisma.durasiPerItem.update({ where: { id }, data });
};

export const toggleDurasiPerItem = async (id: string, outletId: string) => {
  const existing = await prisma.durasiPerItem.findUnique({
    where: { id },
    include: { jenis_per_item: { include: { item_layanan: true } } }
  });
  if (!existing || existing.jenis_per_item.item_layanan.outlet_id !== outletId) throw new AppError(404, "Durasi per item tidak ditemukan");

  return prisma.durasiPerItem.update({ where: { id }, data: { is_active: !existing.is_active } });
};

export const deleteDurasiPerItem = async (id: string, outletId: string) => {
  const existing = await prisma.durasiPerItem.findUnique({
    where: { id },
    include: { jenis_per_item: { include: { item_layanan: true } } }
  });
  if (!existing || existing.jenis_per_item.item_layanan.outlet_id !== outletId) throw new AppError(404, "Durasi per item tidak ditemukan");

  return prisma.durasiPerItem.delete({ where: { id } });
};
