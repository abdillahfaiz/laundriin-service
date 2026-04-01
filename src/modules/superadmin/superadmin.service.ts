import prisma from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";
import { createAndSendNotification } from "../../utils/notification.util";
import { Decimal } from "@prisma/client/runtime/library";

// ========== DASHBOARD ==========
export const getDashboard = async () => {
  const [totalOutlets, activeOutlets, totalOrders, totalUsers] = await Promise.all([
    prisma.outlet.count(),
    prisma.outlet.count({ where: { status: "aktif" } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "customer" } }),
  ]);

  const totalTransaksi = await prisma.payment.aggregate({
    where: { status: "settlement" },
    _sum: { total_bayar: true },
  });

  return {
    total_outlets: totalOutlets,
    active_outlets: activeOutlets,
    total_orders: totalOrders,
    total_users: totalUsers,
    total_transaksi: Number(totalTransaksi._sum.total_bayar || 0),
  };
};

// ========== OUTLET MANAGEMENT ==========
export const getOutlets = async () => {
  return prisma.outlet.findMany({
    include: {
      admin: { select: { nama: true, nomor_telepon: true } },
    },
    orderBy: { created_at: "desc" },
  });
};

export const getOutletById = async (outletId: string) => {
  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId },
    include: {
      admin: { select: { nama: true, nomor_telepon: true } },
      operasional: true,
      _count: { select: { orders: true, kasir: true } },
    },
  });

  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");
  return outlet;
};

export const updateOutletStatus = async (outletId: string, status: string) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
  if (!outlet) throw new AppError(404, "Outlet tidak ditemukan");

  return prisma.outlet.update({
    where: { id: outletId },
    data: { status: status as any },
  });
};

// ========== PENCAIRAN ==========
export const getPencairanList = async () => {
  return prisma.pencairanSaldo.findMany({
    include: {
      outlet: { select: { nama_outlet: true } },
    },
    orderBy: { created_at: "desc" },
  });
};

export const getPencairanById = async (id: string) => {
  const pencairan = await prisma.pencairanSaldo.findUnique({
    where: { id },
    include: {
      outlet: { select: { nama_outlet: true, admin_id: true } },
      superadmin: { select: { nama: true } },
    },
  });

  if (!pencairan) throw new AppError(404, "Pencairan tidak ditemukan");
  return pencairan;
};

export const processPencairan = async (
  pencairanId: string,
  status: string,
  buktiTransfer: string | undefined,
  catatanAdmin: string | undefined,
  reviewerId: string
) => {
  const pencairan = await prisma.pencairanSaldo.findUnique({
    where: { id: pencairanId },
    include: {
      outlet: {
        include: {
          admin: { select: { fcm_token: true } },
        },
      },
    },
  });

  if (!pencairan) throw new AppError(404, "Pencairan tidak ditemukan");

  if (!["berhasil", "ditolak"].includes(status)) {
    throw new AppError(400, "Status tidak valid");
  }

  return prisma.$transaction(async (tx: any) => {
    const updated = await tx.pencairanSaldo.update({
      where: { id: pencairanId },
      data: {
        status: status as any,
        bukti_transfer: buktiTransfer || null,
        catatan_admin: catatanAdmin || null,
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
      },
    });

    // If rejected, return saldo
    if (status === "ditolak") {
      const currentSaldo = pencairan.outlet.saldo;
      const newSaldo = currentSaldo.add(pencairan.jumlah);

      await tx.outlet.update({
        where: { id: pencairan.outlet_id },
        data: { saldo: newSaldo },
      });

      await tx.saldoLog.create({
        data: {
          outlet_id: pencairan.outlet_id,
          tipe: "kredit",
          jumlah: pencairan.jumlah,
          saldo_sebelum: currentSaldo,
          saldo_sesudah: newSaldo,
          referensi_id: pencairanId,
          keterangan: "Pengembalian saldo - pencairan ditolak",
        },
      });
    }

    // Notify outlet admin
    const notifMessage = status === "berhasil"
      ? "Pencairan saldo Anda telah berhasil diproses."
      : `Pencairan saldo Anda ditolak. ${catatanAdmin || ""}`;

    await createAndSendNotification(
      pencairan.outlet.admin_id,
      null,
      status === "berhasil" ? "Pencairan Berhasil" : "Pencairan Ditolak",
      notifMessage,
      "pencairan",
      pencairan.outlet.admin?.fcm_token || null
    );

    return updated;
  });
};

// ========== USER MANAGEMENT ==========
export const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      nama: true,
      nomor_telepon: true,
      role: true,
      is_active: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });
};

export const toggleUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User tidak ditemukan");

  return prisma.user.update({
    where: { id: userId },
    data: { is_active: !user.is_active },
    select: { id: true, nama: true, is_active: true },
  });
};
