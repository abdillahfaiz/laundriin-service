import prisma from "../../../config/database";
import { AppError } from "../../../middlewares/error.middleware";
import bcrypt from "bcryptjs";

export const getKasirList = async (outletId: string) => {
  return prisma.outletKasir.findMany({
    where: { outlet_id: outletId },
    include: {
      user: {
        select: { id: true, nama: true, nomor_telepon: true, is_active: true, created_at: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

export const createKasir = async (outletId: string, data: any) => {
  // Check if phone number exists
  const existing = await prisma.user.findUnique({ where: { nomor_telepon: data.nomor_telepon } });
  if (existing) throw new AppError(409, "Nomor telepon sudah terdaftar");

  const hashedPassword = await bcrypt.hash(data.password, 12);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        nama: data.nama,
        nomor_telepon: data.nomor_telepon,
        password: hashedPassword,
        role: "kasir",
      },
    });

    const kasir = await tx.outletKasir.create({
      data: {
        outlet_id: outletId,
        user_id: user.id,
      },
      include: {
        user: { select: { id: true, nama: true, nomor_telepon: true } },
      },
    });

    return kasir;
  });
};

export const updateKasir = async (kasirId: string, outletId: string, data: any) => {
  const kasir = await prisma.outletKasir.findUnique({
    where: { id: kasirId },
    include: { user: true },
  });

  if (!kasir || kasir.outlet_id !== outletId) throw new AppError(404, "Kasir tidak ditemukan");

  if (data.nomor_telepon && data.nomor_telepon !== kasir.user.nomor_telepon) {
    const existing = await prisma.user.findUnique({ where: { nomor_telepon: data.nomor_telepon } });
    if (existing) throw new AppError(409, "Nomor telepon sudah terdaftar");
  }

  return prisma.user.update({
    where: { id: kasir.user_id },
    data: {
      nama: data.nama,
      nomor_telepon: data.nomor_telepon,
    },
    select: { id: true, nama: true, nomor_telepon: true },
  });
};

export const toggleKasir = async (kasirId: string, outletId: string) => {
  const kasir = await prisma.outletKasir.findUnique({
    where: { id: kasirId },
    include: { user: true },
  });

  if (!kasir || kasir.outlet_id !== outletId) throw new AppError(404, "Kasir tidak ditemukan");

  const updated = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: kasir.user_id },
      data: { is_active: !kasir.user.is_active },
    });

    return tx.outletKasir.update({
      where: { id: kasirId },
      data: { is_active: !kasir.is_active },
      include: {
        user: { select: { id: true, nama: true, is_active: true } },
      },
    });
  });

  return updated;
};
