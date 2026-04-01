"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderQR = exports.getOrderById = exports.getOrderHistory = exports.getActiveOrders = exports.createOrder = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const client_1 = require("@prisma/client");
const error_middleware_1 = require("../../../middlewares/error.middleware");
const qrcode_util_1 = require("../../../utils/qrcode.util");
const dayjs_1 = __importDefault(require("dayjs"));
const library_1 = require("@prisma/client/runtime/library");
/**
 * Generate transaction ID: TRX-{YYYYMMDD}-{6 chars alphanumeric uppercase}
 */
const generateTransactionId = () => {
    const date = (0, dayjs_1.default)().format("YYYYMMDD");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TRX-${date}-${result}`;
};
const createOrder = async (body, user) => {
    const { outlet_id, tipe_layanan, parfum_id, special_notes } = body;
    // Validate outlet exists and is active
    const outlet = await database_1.default.outlet.findUnique({ where: { id: outlet_id } });
    if (!outlet || outlet.status !== "aktif") {
        throw new error_middleware_1.AppError(404, "Outlet tidak ditemukan atau sedang nonaktif");
    }
    // Validate parfum if provided
    let parfumHarga = new library_1.Decimal(0);
    if (parfum_id) {
        const parfum = await database_1.default.parfum.findUnique({ where: { id: parfum_id } });
        if (!parfum || !parfum.is_active)
            throw new error_middleware_1.AppError(404, "Parfum tidak ditemukan");
        parfumHarga = parfum.harga;
    }
    const transactionId = generateTransactionId();
    const qrCode = await (0, qrcode_util_1.generateQR)(transactionId);
    if (tipe_layanan === "per_kg") {
        const { jenis_layanan_id, durasi_layanan_id } = body;
        // Validate jenis layanan
        const jenisLayanan = await database_1.default.jenisLayanan.findUnique({ where: { id: jenis_layanan_id } });
        if (!jenisLayanan || !jenisLayanan.is_active || jenisLayanan.outlet_id !== outlet_id) {
            throw new error_middleware_1.AppError(404, "Jenis layanan tidak ditemukan");
        }
        // Validate durasi
        const durasiLayanan = await database_1.default.durasiLayanan.findUnique({ where: { id: durasi_layanan_id } });
        if (!durasiLayanan || !durasiLayanan.is_active || durasiLayanan.jenis_layanan_id !== jenis_layanan_id) {
            throw new error_middleware_1.AppError(404, "Durasi layanan tidak ditemukan");
        }
        // For per_kg: total_harga_final computed when kasir inputs weight
        const order = await database_1.default.order.create({
            data: {
                transaction_id: transactionId,
                customer_id: user.userId,
                outlet_id,
                jenis_layanan_id,
                durasi_layanan_id,
                parfum_id: parfum_id || null,
                special_notes: special_notes || null,
                status: client_1.OrderStatus.menunggu_drop,
                qr_code: qrCode,
                status_logs: {
                    create: {
                        status: client_1.OrderStatus.menunggu_drop,
                        changed_by: user.userId,
                        note: "Order dibuat oleh customer",
                    },
                },
            },
            include: {
                jenis_layanan: { select: { nama: true } },
                durasi_layanan: { select: { nama: true, estimasi_jam: true, harga: true } },
                parfum: { select: { nama: true, harga: true } },
                outlet: { select: { nama_outlet: true } },
            },
        });
        return order;
    }
    else {
        // per_item
        const { items } = body;
        // Validate and calculate each item
        let totalHarga = new library_1.Decimal(0);
        const orderItemsData = [];
        for (const item of items) {
            // Find the specific DurasiPerItem, which includes JenisPerItem and ItemLayanan
            const durasiPerItem = await database_1.default.durasiPerItem.findUnique({
                where: { id: item.durasi_per_item_id },
                include: {
                    jenis_per_item: {
                        include: { item_layanan: true }
                    }
                }
            });
            if (!durasiPerItem || !durasiPerItem.is_active || !durasiPerItem.jenis_per_item.is_active || !durasiPerItem.jenis_per_item.item_layanan.is_active) {
                throw new error_middleware_1.AppError(404, `Harga item layanan tidak ditemukan atau tidak aktif`);
            }
            if (durasiPerItem.jenis_per_item.item_layanan.outlet_id !== outlet_id) {
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
        totalHarga = totalHarga.add(parfumHarga);
        const order = await database_1.default.order.create({
            data: {
                transaction_id: transactionId,
                customer_id: user.userId,
                outlet_id,
                jenis_order: "drop_and_go",
                parfum_id: parfum_id || null,
                special_notes: special_notes || null,
                total_harga_final: totalHarga,
                status: client_1.OrderStatus.menunggu_drop,
                qr_code: qrCode,
                order_items: {
                    createMany: { data: orderItemsData },
                },
                status_logs: {
                    create: {
                        status: client_1.OrderStatus.menunggu_drop,
                        changed_by: user.userId,
                        note: "Order dibuat oleh customer",
                    },
                },
            },
            include: {
                order_items: {
                    include: {
                        item_layanan: { select: { nama_item: true } },
                        jenis_per_item: { select: { nama: true } },
                        durasi_per_item: { select: { nama: true, estimasi_jam: true } },
                    },
                },
                parfum: { select: { nama: true, harga: true } },
                outlet: { select: { nama_outlet: true } },
            },
        });
        return order;
    }
};
exports.createOrder = createOrder;
const getActiveOrders = async (userId) => {
    const orders = await database_1.default.order.findMany({
        where: {
            customer_id: userId,
            status: {
                in: [
                    client_1.OrderStatus.menunggu_drop,
                    client_1.OrderStatus.menunggu_ditimbang,
                    client_1.OrderStatus.sedang_diproses,
                    client_1.OrderStatus.siap_diambil,
                ],
            },
        },
        include: {
            outlet: { select: { nama_outlet: true } },
            jenis_layanan: { select: { nama: true } },
        },
        orderBy: { created_at: "desc" },
    });
    return orders;
};
exports.getActiveOrders = getActiveOrders;
const getOrderHistory = async (userId) => {
    const orders = await database_1.default.order.findMany({
        where: {
            customer_id: userId,
            status: { in: [client_1.OrderStatus.selesai, client_1.OrderStatus.dibatalkan] },
        },
        include: {
            outlet: { select: { nama_outlet: true } },
            jenis_layanan: { select: { nama: true } },
        },
        orderBy: { created_at: "desc" },
    });
    return orders;
};
exports.getOrderHistory = getOrderHistory;
const getOrderById = async (orderId, userId) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            outlet: { select: { nama_outlet: true, alamat: true } },
            jenis_layanan: { select: { nama: true } },
            durasi_layanan: { select: { nama: true, estimasi_jam: true, harga: true } },
            parfum: { select: { nama: true, harga: true } },
            order_items: {
                include: {
                    item_layanan: { select: { nama_item: true } },
                    jenis_per_item: { select: { nama: true } },
                    durasi_per_item: { select: { nama: true, estimasi_jam: true } },
                },
            },
            status_logs: {
                orderBy: { created_at: "asc" },
                include: { user: { select: { nama: true, role: true } } },
            },
            payment: true,
        },
    });
    if (!order || order.customer_id !== userId) {
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    }
    return order;
};
exports.getOrderById = getOrderById;
const getOrderQR = async (orderId, userId) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            transaction_id: true,
            qr_code: true,
            customer_id: true,
        },
    });
    if (!order || order.customer_id !== userId) {
        throw new error_middleware_1.AppError(404, "Order tidak ditemukan");
    }
    return {
        transaction_id: order.transaction_id,
        qr_code: order.qr_code,
    };
};
exports.getOrderQR = getOrderQR;
//# sourceMappingURL=order.service.js.map