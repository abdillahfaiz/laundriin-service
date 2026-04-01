import { z } from "zod/v4";
export declare const registerCustomerSchema: z.ZodObject<{
    nama: z.ZodString;
    nomor_telepon: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const registerOutletSchema: z.ZodObject<{
    nama_outlet: z.ZodString;
    alamat: z.ZodString;
    foto_outlet: z.ZodOptional<z.ZodString>;
    lat: z.ZodCoercedNumber<unknown>;
    lng: z.ZodCoercedNumber<unknown>;
    nama_pemilik: z.ZodString;
    nomor_telepon: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    nomor_telepon: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const refreshTokenSchema: z.ZodObject<{
    refresh_token: z.ZodString;
}, z.core.$strip>;
export declare const fcmTokenSchema: z.ZodObject<{
    fcm_token: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=auth.schema.d.ts.map