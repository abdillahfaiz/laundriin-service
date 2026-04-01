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

  const [totalOrder, newOrder, completedOrder, outlet] = await Promise.all([
    prisma.order.count({
      where: { outlet_id: outletId, created_at: { gte: dateFilter } },
    }),
    prisma.order.count({
      where: { outlet_id: outletId, status: "menunggu_drop", created_at: { gte: dateFilter } },
    }),
    prisma.order.count({
      where: { outlet_id: outletId, status: "selesai", created_at: { gte: dateFilter } },
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
    completed_order: completedOrder,
    total_transaksi: Number(totalTransaksi._sum.total_bayar || 0),
    saldo: Number(outlet?.saldo || 0),
  };
};
