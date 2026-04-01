"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKasirSchema = exports.createKasirSchema = void 0;
const v4_1 = require("zod/v4");
exports.createKasirSchema = v4_1.z.object({
    nama: v4_1.z.string().min(2).max(100),
    nomor_telepon: v4_1.z.string().regex(/^08[0-9]{8,11}$/, "Format nomor tidak valid"),
    password: v4_1.z.string().min(8).max(100),
});
exports.updateKasirSchema = v4_1.z.object({
    nama: v4_1.z.string().min(2).max(100).optional(),
    nomor_telepon: v4_1.z.string().regex(/^08[0-9]{8,11}$/, "Format nomor tidak valid").optional(),
});
//# sourceMappingURL=kasir.schema.js.map