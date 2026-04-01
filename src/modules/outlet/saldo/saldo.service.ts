import { Prisma } from "@prisma/client";
import prisma from "../../../config/database";
import { AppError } from "../../../middlewares/error.middleware";
import { Decimal } from "@prisma/client/runtime/library";

export const getSaldo = async (outletId: string) => {
  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId },
    select: { saldo: true },
  });

  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");
  return { saldo: outlet.saldo };
};

export const getSaldoLog = async (outletId: string) => {
  return prisma.saldoLog.findMany({
    where: { outlet_id: outletId },
    orderBy: { created_at: "desc" },
    take: 50,
  });
};

export const requestPencairan = async (outletId: string, data: any) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");

  // [CRITICAL] Validate: jumlah <= outlets.saldo
  if (new Decimal(data.jumlah).gt(outlet.saldo)) {
    throw new AppError(400, "Saldo tidak mencukupi");
  }

  // [CRITICAL] Max 1 pending/diproses request at a time
  const pendingRequest = await prisma.pencairanSaldo.findFirst({
    where: {
      outlet_id: outletId,
      status: { in: ["pending", "diproses"] },
    },
  });

  if (pendingRequest) {
    throw new AppError(409, "Masih ada request pencairan yang sedang diproses");
  }

  // Hold saldo
  const newSaldo = outlet.saldo.sub(new Decimal(data.jumlah));

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Debit saldo
    await tx.outlet.update({
      where: { id: outletId },
      data: { saldo: newSaldo },
    });

    await tx.saldoLog.create({
      data: {
        outlet_id: outletId,
        tipe: "debit",
        jumlah: data.jumlah,
        saldo_sebelum: outlet.saldo,
        saldo_sesudah: newSaldo,
        keterangan: "Hold saldo untuk pencairan",
      },
    });

    return tx.pencairanSaldo.create({
      data: {
        outlet_id: outletId,
        jumlah: data.jumlah,
        nomor_rekening: data.nomor_rekening,
        nama_pemilik_rekening: data.nama_pemilik_rekening,
        bank_tujuan: data.bank_tujuan,
      },
    });
  });
};

export const getPencairanList = async (outletId: string) => {
  return prisma.pencairanSaldo.findMany({
    where: { outlet_id: outletId },
    orderBy: { created_at: "desc" },
  });
};

export const getPencairanById = async (pencairanId: string, outletId: string) => {
  const pencairan = await prisma.pencairanSaldo.findUnique({
    where: { id: pencairanId },
    include: {
      superadmin: { select: { nama: true } },
    },
  });

  if (!pencairan || pencairan.outlet_id !== outletId) {
    throw new AppError(404, "Request pencairan tidak ditemukan");
  }

  return pencairan;
};
