"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const dayjs_1 = __importDefault(require("dayjs"));
const getDashboard = async (outletId, periode = "today") => {
    let dateFilter;
    switch (periode) {
        case "week":
            dateFilter = (0, dayjs_1.default)().subtract(7, "day").toDate();
            break;
        case "month":
            dateFilter = (0, dayjs_1.default)().subtract(30, "day").toDate();
            break;
        case "today":
        default:
            dateFilter = (0, dayjs_1.default)().startOf("day").toDate();
            break;
    }
    const [totalOrder, newOrder, completedOrder, outlet] = await Promise.all([
        database_1.default.order.count({
            where: { outlet_id: outletId, created_at: { gte: dateFilter } },
        }),
        database_1.default.order.count({
            where: { outlet_id: outletId, status: "menunggu_drop", created_at: { gte: dateFilter } },
        }),
        database_1.default.order.count({
            where: { outlet_id: outletId, status: "selesai", created_at: { gte: dateFilter } },
        }),
        database_1.default.outlet.findUnique({
            where: { id: outletId },
            select: { saldo: true },
        }),
    ]);
    // Calculate total transaksi from settled payments
    const totalTransaksi = await database_1.default.payment.aggregate({
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
exports.getDashboard = getDashboard;
//# sourceMappingURL=dashboard.service.js.map