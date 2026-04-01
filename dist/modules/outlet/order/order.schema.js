"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dijemputSchema = exports.konfirmasiPickupSchema = exports.walkinOrderSchema = exports.updateStatusSchema = exports.timbangSchema = exports.scanQrSchema = exports.outletOrderQuerySchema = void 0;
const v4_1 = require("zod/v4");
exports.outletOrderQuerySchema = v4_1.z.object({
    status: v4_1.z.enum([
        "menunggu_drop", "menunggu_ditimbang", "sedang_diproses",
        "siap_diambil", "selesai", "dibatalkan",
        "menunggu_konfirmasi", "dikonfirmasi", "kurir_menuju",
        "barang_dijemput", "siap_diantar", "sedang_diantar",
    ]).optional(),
    tipe_layanan: v4_1.z.enum(["per_kg", "per_item"]).optional(),
    jenis_order: v4_1.z.enum(["drop_and_go", "antar_jemput"]).optional(),
    page: v4_1.z.coerce.number().int().min(1).optional(),
    limit: v4_1.z.coerce.number().int().min(1).max(100).optional(),
});
exports.scanQrSchema = v4_1.z.object({
    qr_code: v4_1.z.string().min(1),
});
exports.timbangSchema = v4_1.z.object({
    berat_aktual: v4_1.z.number().min(0.1).max(100),
    foto_timbangan: v4_1.z.string().min(1),
});
exports.updateStatusSchema = v4_1.z.object({
    status: v4_1.z.enum([
        "menunggu_ditimbang", "sedang_diproses",
        "siap_diambil", "selesai", "dibatalkan",
        "dikonfirmasi", "kurir_menuju", "barang_dijemput",
        "siap_diantar", "sedang_diantar",
    ]),
    note: v4_1.z.string().optional(),
});
exports.walkinOrderSchema = v4_1.z.object({
    customer_nama: v4_1.z.string().min(2).max(100),
    customer_telepon: v4_1.z.string().regex(/^08[0-9]{8,11}$/, "Format nomor tidak valid"),
    tipe_layanan: v4_1.z.enum(["per_kg", "per_item"]),
    jenis_layanan_id: v4_1.z.string().uuid().optional(),
    durasi_layanan_id: v4_1.z.string().uuid().optional(),
    parfum_id: v4_1.z.string().uuid().optional(),
    berat_aktual: v4_1.z.number().min(0.1).max(100).optional(),
    foto_timbangan: v4_1.z.string().optional(),
    special_notes: v4_1.z.string().max(500).optional(),
    // Per item walk-in
    items: v4_1.z.array(v4_1.z.object({
        item_layanan_id: v4_1.z.string().uuid(),
        jenis_per_item_id: v4_1.z.string().uuid(),
        durasi_per_item_id: v4_1.z.string().uuid(),
        qty: v4_1.z.number().int().min(1).max(100),
    })).optional(),
});
exports.konfirmasiPickupSchema = v4_1.z.object({
    kurir_id: v4_1.z.string().uuid(),
});
exports.dijemputSchema = v4_1.z.object({
    foto_barang_pickup: v4_1.z.string().min(1, "Foto barang pickup WAJIB disertakan"),
});
//# sourceMappingURL=order.schema.js.map