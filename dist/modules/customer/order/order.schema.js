"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = exports.createOrderPerItemSchema = exports.createOrderPerKgSchema = void 0;
const v4_1 = require("zod/v4");
exports.createOrderPerKgSchema = v4_1.z.object({
    outlet_id: v4_1.z.string().uuid(),
    tipe_layanan: v4_1.z.literal("per_kg"),
    jenis_order: v4_1.z.enum(["drop_and_go", "antar_jemput"]),
    jenis_layanan_id: v4_1.z.string().uuid(),
    durasi_layanan_id: v4_1.z.string().uuid(),
    parfum_id: v4_1.z.string().uuid().optional(),
    special_notes: v4_1.z.string().max(500).optional(),
    pickup: v4_1.z.object({
        alamat_pickup: v4_1.z.string().min(10),
        lat_pickup: v4_1.z.number().min(-90).max(90),
        lng_pickup: v4_1.z.number().min(-180).max(180),
        alamat_antar: v4_1.z.string().optional(),
        lat_antar: v4_1.z.number().optional(),
        lng_antar: v4_1.z.number().optional(),
        jadwal_jemput: v4_1.z.string().datetime(),
        catatan_alamat: v4_1.z.string().max(200).optional(),
    }).optional(), // required only if jenis_order === 'antar_jemput'
});
exports.createOrderPerItemSchema = v4_1.z.object({
    outlet_id: v4_1.z.string().uuid(),
    tipe_layanan: v4_1.z.literal("per_item"),
    jenis_order: v4_1.z.enum(["drop_and_go", "antar_jemput"]),
    parfum_id: v4_1.z.string().uuid().optional(),
    special_notes: v4_1.z.string().max(500).optional(),
    items: v4_1.z.array(v4_1.z.object({
        item_layanan_id: v4_1.z.string().uuid(),
        jenis_per_item_id: v4_1.z.string().uuid(), // WAJIB
        durasi_per_item_id: v4_1.z.string().uuid(), // WAJIB
        qty: v4_1.z.number().int().min(1).max(100),
    })).min(1),
    pickup: v4_1.z.object({
        alamat_pickup: v4_1.z.string().min(10),
        lat_pickup: v4_1.z.number().min(-90).max(90),
        lng_pickup: v4_1.z.number().min(-180).max(180),
        alamat_antar: v4_1.z.string().optional(),
        lat_antar: v4_1.z.number().optional(),
        lng_antar: v4_1.z.number().optional(),
        jadwal_jemput: v4_1.z.string().datetime(),
        catatan_alamat: v4_1.z.string().max(200).optional(),
    }).optional(), // required only if jenis_order === 'antar_jemput'
});
exports.createOrderSchema = v4_1.z.discriminatedUnion("tipe_layanan", [
    exports.createOrderPerKgSchema,
    exports.createOrderPerItemSchema,
]);
//# sourceMappingURL=order.schema.js.map