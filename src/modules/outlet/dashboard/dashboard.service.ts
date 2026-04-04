import prisma from "../../../config/database";
import dayjs from "dayjs";

export const getDashboard = async (outletId: string, periode: string = "today") => {
  let dateFilter: Date;

  switch (periode) {
    case "week":
      dateFilter = dayjs().subtract(7, "day").toDate();
      break;
    case "month":
      dateFilter = dayjs().subtract(30, "day").toDate();
      break;
    case "today":
    default:
      dateFilter = dayjs().startOf("day").toDate();
      break;
  }

  const [totalOrder, newOrder, inProgressOrder, completedOrder, outlet] = await Promise.all([
    // Total order yang masuk di periode ini (berdasarkan waktu dibuat)
    prisma.order.count({
      where: { outlet_id: outletId, created_at: { gte: dateFilter } },
    }),
    // Order baru yang menunggu proses (belum di-drop / belum dikonfirmasi)
    prisma.order.count({
      where: {
        outlet_id: outletId,
        status: { in: ["menunggu_drop", "menunggu_konfirmasi", "menunggu_ditimbang"] },
        created_at: { gte: dateFilter },
      },
    }),
    // Order yang sedang aktif diproses (gunakan updated_at agar order lama yang masih jalan ikut terhitung)
    prisma.order.count({
      where: {
        outlet_id: outletId,
        status: {
          in: [
            "sedang_diproses",
            "dikonfirmasi",
            "kurir_menuju",
            "barang_dijemput",
            "siap_diantar",
            "sedang_diantar",
            "siap_diambil",
          ],
        },
        updated_at: { gte: dateFilter },
      },
    }),
    // Order selesai — pakai updated_at bukan created_at
    // agar order yang dibuat kemarin tapi selesai hari ini tetap terhitung
    prisma.order.count({
      where: {
        outlet_id: outletId,
        status: "selesai",
        updated_at: { gte: dateFilter },
      },
    }),
    prisma.outlet.findUnique({
      where: { id: outletId },
      select: { saldo: true },
    }),
  ]);

  // Calculate total transaksi from settled payments
  const totalTransaksi = await prisma.payment.aggregate({
    where: {
      order: { outlet_id: outletId },
      status: "settlement",
      paid_at: { gte: dateFilter },
    },
    _sum: { total_bayar: true },
  });

  return {
    total_order: totalOrder,
    new_order: newOrder,
    in_progress: inProgressOrder,
    completed_order: completedOrder,
    total_transaksi: Number(totalTransaksi._sum.total_bayar || 0),
    saldo: Number(outlet?.saldo || 0),
  };
};
