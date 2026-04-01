"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pencairanSchema = void 0;
const v4_1 = require("zod/v4");
exports.pencairanSchema = v4_1.z.object({
    jumlah: v4_1.z.number().min(50000, "Minimum pencairan Rp 50.000"),
    nomor_rekening: v4_1.z.string().min(5).max(50),
    nama_pemilik_rekening: v4_1.z.string().min(2).max(100),
    bank_tujuan: v4_1.z.string().min(2).max(50),
});
//# sourceMappingURL=saldo.schema.js.map