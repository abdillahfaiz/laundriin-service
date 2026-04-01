"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = exports.createOrderPerItemSchema = exports.createOrderPerKgSchema = void 0;
const v4_1 = require("zod/v4");
exports.createOrderPerKgSchema = v4_1.z.object({
    outlet_id: v4_1.z.string().uuid(),
    tipe_layanan: v4_1.z.literal("per_kg"),
    jenis_layanan_id: v4_1.z.string().uuid(),
    durasi_layanan_id: v4_1.z.string().uuid(),
    parfum_id: v4_1.z.string().uuid().optional(),
    special_notes: v4_1.z.string().max(500).optional(),
});
exports.createOrderPerItemSchema = v4_1.z.object({
    outlet_id: v4_1.z.string().uuid(),
    tipe_layanan: v4_1.z.literal("per_item"),
    parfum_id: v4_1.z.string().uuid().optional(),
    special_notes: v4_1.z.string().max(500).optional(),
    items: v4_1.z.array(v4_1.z.object({
        item_layanan_id: v4_1.z.string().uuid(),
        durasi_layanan_id: v4_1.z.string().uuid(),
        qty: v4_1.z.number().int().min(1).max(99),
    })).min(1),
});
exports.createOrderSchema = v4_1.z.discriminatedUnion("tipe_layanan", [
    exports.createOrderPerKgSchema,
    exports.createOrderPerItemSchema,
]);
//# sourceMappingURL=order.schema.js.map