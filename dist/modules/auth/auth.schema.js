"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fcmTokenSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerOutletSchema = exports.registerCustomerSchema = void 0;
const v4_1 = require("zod/v4");
exports.registerCustomerSchema = v4_1.z.object({
    nama: v4_1.z.string().min(2).max(100),
    nomor_telepon: v4_1.z.string().regex(/^08[0-9]{8,20}$/, "Format nomor tidak valid"),
    password: v4_1.z.string().min(8).max(100),
});
exports.registerOutletSchema = v4_1.z.object({
    nama_outlet: v4_1.z.string().min(2).max(150),
    alamat: v4_1.z.string().min(5),
    foto_outlet: v4_1.z.string().optional(),
    lat: v4_1.z.coerce.number().min(-90).max(90),
    lng: v4_1.z.coerce.number().min(-180).max(180),
    nama_pemilik: v4_1.z.string().min(2).max(100),
    nomor_telepon: v4_1.z.string().regex(/^08[0-9]{8,20}$/, "Format nomor tidak valid"),
    password: v4_1.z.string().min(8).max(100),
});
exports.loginSchema = v4_1.z.object({
    nomor_telepon: v4_1.z.string().regex(/^08[0-9]{8,20}$/, "Format nomor tidak valid"),
    password: v4_1.z.string().min(1),
});
exports.refreshTokenSchema = v4_1.z.object({
    refresh_token: v4_1.z.string().min(1),
});
exports.fcmTokenSchema = v4_1.z.object({
    fcm_token: v4_1.z.string().min(1),
});
//# sourceMappingURL=auth.schema.js.map