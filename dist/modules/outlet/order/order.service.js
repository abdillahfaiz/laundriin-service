"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickupSelesaiAntar = exports.pickupDiantar = exports.pickupDijemput = exports.pickupBerangkat = exports.konfirmasiPickup = exports.getPickupOrders = exports.createWalkinOrder = exports.updateOrderStatus = exports.timbangOrder = exports.scanQR = exports.getOrderById = exports.getOrders = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const error_middleware_1 = require("../../../middlewares/error.middleware");
const notification_util_1 = require("../../../utils/notification.util");
const qrcode_util_1 = require("../../../utils/qrcode.util");
const library_1 = require("@prisma/client/runtime/library");
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dayjs_1 = __importDefault(require("dayjs"));
const generateTransactionId = () => {
    const date = (0, dayjs_1.default)().format("YYYYMMDD");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TRX-${date}-${result}`;
};
// [CRITICAL] Validate order belongs to outlet
const validateOutletOwnership = (order, outletId) => {
    if (order.outlet_id !== outletId) {
        throw new error_middleware_1.AppError(403, "Order bukan milik outlet Anda");
    }
};
// [CRITICAL] Valid status transitions — from AGENT_REFERENCE v3
const VALID_TRANSITIONS = {
    menunggu_drop: ["menunggu_ditimbang", "dibatalkan"],
    menunggu_konfirmasi: ["dikonfirmasi", "dibatalkan"],
    dikonfirmasi: ["kurir_menuju", "dibatalkan"],
    kurir_menuju: ["barang_dijemput"],
    barang_dijemput: ["menunggu_ditimbang"],
    menunggu_ditimbang: ["sedang_diproses", "dibatalkan"], // kasir bebas proses tanpa cek payment
    sedang_diproses: ["siap_diambil", "siap_diantar"],
    siap_diambil: ["selesai"], // ⚠️ backend WAJIB validasi payment.status === 'settlement'
    siap_diantar: ["sedang_diantar"], // ⚠️ backend WAJIB validasi payment.status === 'settlement'
    sedang_diantar: ["selesai"],
    selesai: [],
    dibatalkan: [],
};
const getOrders = async (outletId, query) => {
    const where = { outlet_id: outletId };
    if (query.status)
        where.status = query.status;
    if (query.tipe_layanan)
        where.tipe_layanan = query.tipe_layanan;
    if (query.jenis_order)
        where.jenis_order = query.jenis_order;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        database_1.default.order.findMany({
            where,
            include: {
                customer: { select: { nama: true, nomor_telepon: true } },
                jenis_layanan: { select: { nama: true } },
                payment: { select: { status: true } },
            },
            orderBy: { created_at: "desc" },
            skip,
            take: limit,
        }),
        database_1.default.order.count({ where }),
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
exports.getOrders = getOrders;
const getOrderById = async (orderId, outletId) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            customer: { select: { nama: true, nomor_telepon: true } },
            jenis_layanan: { select: { nama: true } },
            durasi_layanan: { select: { nama: true, estimasi_jam: true, harga: true } },
            parfum: { select: { nama: true, harga: true } },
            order_items: {
                include: {
                    item_layanan: { select: { nama_item: true } },
                    durasi_per_item: { select: { nama: true } },
                    jenis_per_item: { select: { nama: true } },
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
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, outletId);
    return order;
};
exports.getOrderById = getOrderById;
const scanQR = async (qrCode, outletId) => {
    const order = await database_1.default.order.findUnique({
        where: { transaction_id: qrCode },
        include: {
            customer: { select: { nama: true, nomor_telepon: true } },
            jenis_layanan: { select: { nama: true } },
            durasi_layanan: { select: { nama: true, estimasi_jam: true, harga: true } },
            parfum: { select: { nama: true } },
            order_items: {
                include: {
                    item_layanan: { select: { nama_item: true } },
                    durasi_per_item: { select: { nama: true } },
                    jenis_per_item: { select: { nama: true } },
                },
            },
            payment: { select: { status: true } },
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, outletId);
    return order;
};
exports.scanQR = scanQR;
const timbangOrder = async (orderId, beratAktual, fotoTimbangan, user) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            durasi_layanan: true,
            parfum: true,
            customer: { select: { id: true, fcm_token: true } },
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, user.outletId);
    // [CRITICAL] Timbang hanya untuk per_kg
    if (order.tipe_layanan !== "per_kg") {
        throw new error_middleware_1.AppError(400, "Timbang hanya untuk layanan per_kg");
    }
    if (order.status !== "menunggu_ditimbang") {
        throw new error_middleware_1.AppError(400, "Order tidak dalam status yang bisa ditimbang");
    }
    // [CRITICAL] total_harga_final calculated by backend
    const hargaPerKg = order.durasi_layanan.harga;
    const parfumHarga = order.parfum ? order.parfum.harga : new library_1.Decimal(0);
    const totalHarga = new library_1.Decimal(beratAktual).mul(hargaPerKg).add(parfumHarga);
    const updatedOrder = await database_1.default.$transaction(async (tx) => {
        const updated = await tx.order.update({
            where: { id: orderId },
            data: {
                berat_aktual: beratAktual,
                foto_timbangan: fotoTimbangan,
                total_harga_final: totalHarga,
                status: "menunggu_ditimbang",
                kasir_id: user.userId,
            },
        });
        await tx.orderStatusLog.create({
            data: {
                order_id: orderId,
                status: "menunggu_ditimbang",
                changed_by: user.userId,
                note: `Berat aktual: ${beratAktual} kg. Total: Rp ${totalHarga.toFixed(0)}`,
            },
        });
        return updated;
    });
    // Send notification to customer
    await (0, notification_util_1.createAndSendNotification)(order.customer.id, orderId, "Tagihan Laundry", `Berat: ${beratAktual}kg. Total: Rp ${totalHarga.toFixed(0)}. Silakan lakukan pembayaran.`, "tagihan", order.customer.fcm_token);
    return updatedOrder;
};
exports.timbangOrder = timbangOrder;
const updateOrderStatus = async (orderId, newStatus, note, user) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            customer: { select: { id: true, fcm_token: true } },
            payment: true,
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, user.outletId);
    // [CRITICAL] Status must follow valid transitions
    const allowedStatuses = VALID_TRANSITIONS[order.status];
    if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
        throw new error_middleware_1.AppError(400, `Tidak bisa update status dari ${order.status} ke ${newStatus}`);
    }
    // [CRITICAL] Gate payment — Drop & Go: siap_diambil → selesai
    if (newStatus === "selesai" && order.jenis_order === "drop_and_go") {
        if (order.payment?.status !== "settlement") {
            throw new error_middleware_1.AppError(400, "Tagihan belum dibayar. Minta customer melunasi sebelum barang diserahkan.");
        }
    }
    // [CRITICAL] Gate payment — Antar Jemput: siap_diantar → sedang_diantar
    if (newStatus === "sedang_diantar") {
        if (order.payment?.status !== "settlement") {
            throw new error_middleware_1.AppError(400, "Tagihan belum dibayar. Kurir tidak bisa dikirim sebelum customer melunasi.");
        }
    }
    const updatedOrder = await database_1.default.$transaction(async (tx) => {
        const updated = await tx.order.update({
            where: { id: orderId },
            data: { status: newStatus },
        });
        await tx.orderStatusLog.create({
            data: {
                order_id: orderId,
                status: newStatus,
                changed_by: user.userId,
                note: note || null,
            },
        });
        return updated;
    });
    // Determine notification message
    const notifMessages = {
        sedang_diproses: { judul: "Laundry Diproses", pesan: "Laundry Anda sedang diproses." },
        siap_diambil: { judul: "Laundry Siap", pesan: "Laundry Anda siap diambil!" },
        siap_diantar: { judul: "Laundry Siap Diantar", pesan: "Laundry Anda siap diantar!" },
        sedang_diantar: { judul: "Kurir dalam Perjalanan", pesan: "Kurir sedang dalam perjalanan mengantar laundry Anda." },
        selesai: { judul: "Selesai", pesan: "Terima kasih! Order Anda telah selesai." },
        dibatalkan: { judul: "Order Dibatalkan", pesan: "Order Anda telah dibatalkan." },
    };
    const notif = notifMessages[newStatus];
    if (notif) {
        await (0, notification_util_1.createAndSendNotification)(order.customer.id, orderId, notif.judul, notif.pesan, "status_order", order.customer.fcm_token);
    }
    return updatedOrder;
};
exports.updateOrderStatus = updateOrderStatus;
const createWalkinOrder = async (body, user) => {
    const outletId = user.outletId;
    // Check customer by phone
    let customer = await database_1.default.user.findUnique({
        where: { nomor_telepon: body.customer_telepon },
    });
    if (!customer) {
        // Create new customer with random password
        const randomPassword = (0, uuid_1.v4)();
        const hashedPassword = await bcryptjs_1.default.hash(randomPassword, 12);
        customer = await database_1.default.user.create({
            data: {
                nama: body.customer_nama,
                nomor_telepon: body.customer_telepon,
                password: hashedPassword,
                role: "customer",
            },
        });
    }
    const transactionId = generateTransactionId();
    const qrCode = await (0, qrcode_util_1.generateQR)(transactionId);
    if (body.tipe_layanan === "per_kg") {
        // Walk-in Per KG
        let totalHarga = null;
        if (body.berat_aktual) {
            const durasi = await database_1.default.durasiLayanan.findUnique({ where: { id: body.durasi_layanan_id } });
            if (!durasi)
                throw new error_middleware_1.AppError(404, "Durasi layanan tidak ditemukan");
            const parfumHarga = body.parfum_id
                ? (await database_1.default.parfum.findUnique({ where: { id: body.parfum_id } }))?.harga || new library_1.Decimal(0)
                : new library_1.Decimal(0);
            totalHarga = new library_1.Decimal(body.berat_aktual).mul(durasi.harga).add(parfumHarga);
        }
        const order = await database_1.default.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    transaction_id: transactionId,
                    customer_id: customer.id,
                    outlet_id: outletId,
                    kasir_id: user.userId,
                    tipe_layanan: "per_kg",
                    jenis_order: "drop_and_go",
                    jenis_layanan_id: body.jenis_layanan_id || null,
                    durasi_layanan_id: body.durasi_layanan_id || null,
                    parfum_id: body.parfum_id || null,
                    special_notes: body.special_notes || null,
                    berat_aktual: body.berat_aktual || null,
                    foto_timbangan: body.foto_timbangan || null,
                    total_harga_final: totalHarga,
                    status: "menunggu_ditimbang",
                    is_walkin: true,
                    qr_code: qrCode,
                },
            });
            await tx.orderStatusLog.create({
                data: {
                    order_id: created.id,
                    status: "menunggu_ditimbang",
                    changed_by: user.userId,
                    note: "Walk-in order dibuat oleh kasir",
                },
            });
            return created;
        });
        // Send notification if customer has FCM token
        if (customer.fcm_token) {
            await (0, notification_util_1.createAndSendNotification)(customer.id, order.id, "Order Walk-in", `Pesanan walk-in Anda telah dibuat. Total: Rp ${totalHarga?.toFixed(0) || "Menunggu"}`, "tagihan", customer.fcm_token);
        }
        return order;
    }
    else {
        // Walk-in Per Item
        const { items } = body;
        if (!items || items.length === 0)
            throw new error_middleware_1.AppError(400, "Items tidak boleh kosong untuk per_item");
        let totalHarga = new library_1.Decimal(0);
        const orderItemsData = [];
        for (const item of items) {
            const durasiPerItem = await database_1.default.durasiPerItem.findUnique({
                where: { id: item.durasi_per_item_id },
                include: {
                    jenis_per_item: {
                        include: { item_layanan: true },
                    },
                },
            });
            if (!durasiPerItem || !durasiPerItem.is_active) {
                throw new error_middleware_1.AppError(404, "Durasi per item tidak ditemukan atau tidak aktif");
            }
            if (durasiPerItem.jenis_per_item.item_layanan.outlet_id !== outletId) {
                throw new error_middleware_1.AppError(400, "Item tidak milik outlet ini");
            }
            const subtotal = durasiPerItem.harga.mul(item.qty);
            totalHarga = totalHarga.add(subtotal);
            orderItemsData.push({
                item_layanan_id: durasiPerItem.jenis_per_item.item_layanan.id,
                jenis_per_item_id: durasiPerItem.jenis_per_item.id,
                durasi_per_item_id: durasiPerItem.id,
                qty: item.qty,
                harga_satuan: durasiPerItem.harga,
                subtotal,
            });
        }
        // Add parfum price
        const parfumHarga = body.parfum_id
            ? (await database_1.default.parfum.findUnique({ where: { id: body.parfum_id } }))?.harga || new library_1.Decimal(0)
            : new library_1.Decimal(0);
        totalHarga = totalHarga.add(parfumHarga);
        const order = await database_1.default.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    transaction_id: transactionId,
                    customer_id: customer.id,
                    outlet_id: outletId,
                    kasir_id: user.userId,
                    tipe_layanan: "per_item",
                    jenis_order: "drop_and_go",
                    parfum_id: body.parfum_id || null,
                    special_notes: body.special_notes || null,
                    total_harga_final: totalHarga,
                    status: "menunggu_ditimbang", // per_item walk-in: total langsung diketahui
                    is_walkin: true,
                    qr_code: qrCode,
                    order_items: {
                        createMany: { data: orderItemsData },
                    },
                },
            });
            await tx.orderStatusLog.create({
                data: {
                    order_id: created.id,
                    status: "menunggu_ditimbang",
                    changed_by: user.userId,
                    note: "Walk-in per item order dibuat oleh kasir",
                },
            });
            return created;
        });
        if (customer.fcm_token) {
            await (0, notification_util_1.createAndSendNotification)(customer.id, order.id, "Order Walk-in", `Pesanan walk-in Anda telah dibuat. Total: Rp ${totalHarga.toFixed(0)}`, "tagihan", customer.fcm_token);
        }
        return order;
    }
};
exports.createWalkinOrder = createWalkinOrder;
// ==================== PICKUP / ANTAR JEMPUT ====================
const getPickupOrders = async (outletId) => {
    return database_1.default.order.findMany({
        where: {
            outlet_id: outletId,
            jenis_order: "antar_jemput",
            status: {
                in: [
                    "menunggu_konfirmasi",
                    "dikonfirmasi",
                    "kurir_menuju",
                    "barang_dijemput",
                    "menunggu_ditimbang",
                    "sedang_diproses",
                    "siap_diantar",
                    "sedang_diantar",
                ],
            },
        },
        include: {
            customer: { select: { nama: true, nomor_telepon: true } },
            pickup: true,
            payment: { select: { status: true } },
        },
        orderBy: { created_at: "desc" },
    });
};
exports.getPickupOrders = getPickupOrders;
const konfirmasiPickup = async (orderId, kurirId, user) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            pickup: true,
            customer: { select: { id: true, fcm_token: true } },
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, user.outletId);
    if (order.status !== "menunggu_konfirmasi") {
        throw new error_middleware_1.AppError(400, "Order tidak dalam status menunggu_konfirmasi");
    }
    // [CRITICAL] kurir_id HARUS terdaftar di OutletKasir dengan outlet_id yang sama
    const outletKasir = await database_1.default.outletKasir.findFirst({
        where: {
            user_id: kurirId,
            outlet_id: user.outletId,
            is_active: true,
        },
    });
    if (!outletKasir) {
        throw new error_middleware_1.AppError(400, "Kurir tidak terdaftar atau tidak aktif di outlet ini");
    }
    const updated = await database_1.default.$transaction(async (tx) => {
        await tx.orderPickup.update({
            where: { order_id: orderId },
            data: { kurir_id: kurirId },
        });
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: { status: "dikonfirmasi" },
        });
        await tx.orderStatusLog.create({
            data: {
                order_id: orderId,
                status: "dikonfirmasi",
                changed_by: user.userId,
                note: `Dikonfirmasi, kurir ditugaskan`,
            },
        });
        return updatedOrder;
    });
    await (0, notification_util_1.createAndSendNotification)(order.customer.id, orderId, "Order Dikonfirmasi", "Order Anda telah dikonfirmasi. Kurir akan segera menuju lokasi Anda.", "status_order", order.customer.fcm_token);
    return updated;
};
exports.konfirmasiPickup = konfirmasiPickup;
const pickupBerangkat = async (orderId, user) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            pickup: true,
            customer: { select: { id: true, fcm_token: true } },
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, user.outletId);
    if (order.status !== "dikonfirmasi") {
        throw new error_middleware_1.AppError(400, "Order tidak dalam status dikonfirmasi");
    }
    // [CRITICAL] Hanya kasir yang di-assign sebagai kurir yang bisa update
    if (order.pickup?.kurir_id !== user.userId) {
        throw new error_middleware_1.AppError(403, "Hanya kurir yang ditugaskan yang bisa mengupdate status ini");
    }
    const updated = await database_1.default.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: { status: "kurir_menuju" },
        });
        await tx.orderStatusLog.create({
            data: {
                order_id: orderId,
                status: "kurir_menuju",
                changed_by: user.userId,
                note: "Kurir sedang menuju lokasi",
            },
        });
        return updatedOrder;
    });
    await (0, notification_util_1.createAndSendNotification)(order.customer.id, orderId, "Kurir Menuju Lokasi", "Kurir sedang menuju lokasi Anda untuk menjemput laundry.", "status_order", order.customer.fcm_token);
    return updated;
};
exports.pickupBerangkat = pickupBerangkat;
const pickupDijemput = async (orderId, fotoBarangPickup, user) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            pickup: true,
            customer: { select: { id: true, fcm_token: true } },
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, user.outletId);
    if (order.status !== "kurir_menuju") {
        throw new error_middleware_1.AppError(400, "Order tidak dalam status kurir_menuju");
    }
    // [CRITICAL] foto_barang_pickup WAJIB
    if (!fotoBarangPickup) {
        throw new error_middleware_1.AppError(400, "Foto barang pickup WAJIB disertakan");
    }
    const updated = await database_1.default.$transaction(async (tx) => {
        await tx.orderPickup.update({
            where: { order_id: orderId },
            data: { foto_barang_pickup: fotoBarangPickup },
        });
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: { status: "barang_dijemput" },
        });
        await tx.orderStatusLog.create({
            data: {
                order_id: orderId,
                status: "barang_dijemput",
                changed_by: user.userId,
                note: "Barang telah dijemput",
            },
        });
        return updatedOrder;
    });
    await (0, notification_util_1.createAndSendNotification)(order.customer.id, orderId, "Barang Dijemput", "Barang laundry Anda telah dijemput oleh kurir.", "status_order", order.customer.fcm_token);
    return updated;
};
exports.pickupDijemput = pickupDijemput;
const pickupDiantar = async (orderId, user) => {
    // This handles siap_diantar → sedang_diantar (same as updateOrderStatus with gate payment)
    return (0, exports.updateOrderStatus)(orderId, "sedang_diantar", "Kurir sedang mengantar laundry", user);
};
exports.pickupDiantar = pickupDiantar;
const pickupSelesaiAntar = async (orderId, user) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            customer: { select: { id: true, fcm_token: true } },
        },
    });
    if (!order)
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    validateOutletOwnership(order, user.outletId);
    if (order.status !== "sedang_diantar") {
        throw new error_middleware_1.AppError(400, "Order tidak dalam status sedang_diantar");
    }
    const updated = await database_1.default.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: { status: "selesai" },
        });
        await tx.orderStatusLog.create({
            data: {
                order_id: orderId,
                status: "selesai",
                changed_by: user.userId,
                note: "Laundry telah diterima oleh customer",
            },
        });
        return updatedOrder;
    });
    await (0, notification_util_1.createAndSendNotification)(order.customer.id, orderId, "Selesai", "Terima kasih! Order Anda telah selesai.", "status_order", order.customer.fcm_token);
    return updated;
};
exports.pickupSelesaiAntar = pickupSelesaiAntar;
//# sourceMappingURL=order.service.js.map