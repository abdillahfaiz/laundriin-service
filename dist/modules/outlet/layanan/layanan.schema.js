"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parfumSchema = exports.durasiPerItemSchema = exports.jenisPerItemSchema = exports.itemLayananSchema = exports.durasiLayananSchema = exports.jenisLayananSchema = void 0;
const v4_1 = require("zod/v4");
exports.jenisLayananSchema = v4_1.z.object({
    nama: v4_1.z.string().min(3).max(100),
    deskripsi: v4_1.z.string().max(500).optional(),
    // NO 'tipe' field — JenisLayanan is implicitly per_kg only
});
exports.durasiLayananSchema = v4_1.z.object({
    // jenis_layanan_id comes from route params, NOT body
    nama: v4_1.z.string().min(2).max(100),
    estimasi_jam: v4_1.z.number().int().min(1),
    harga: v4_1.z.number().min(0),
});
exports.itemLayananSchema = v4_1.z.object({
    nama_item: v4_1.z.string().min(2).max(100),
    foto_item: v4_1.z.string().optional(),
});
exports.jenisPerItemSchema = v4_1.z.object({
    nama: v4_1.z.string().min(2).max(100),
    deskripsi: v4_1.z.string().max(500).optional(),
});
exports.durasiPerItemSchema = v4_1.z.object({
    nama: v4_1.z.string().min(2).max(100),
    estimasi_jam: v4_1.z.number().int().min(1),
    harga: v4_1.z.number().min(0),
});
exports.parfumSchema = v4_1.z.object({
    nama: v4_1.z.string().min(2).max(100),
    harga: v4_1.z.number().min(0),
});
//# sourceMappingURL=layanan.schema.js.map