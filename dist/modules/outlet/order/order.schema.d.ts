import { z } from "zod/v4";
export declare const outletOrderQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        menunggu_drop: "menunggu_drop";
        menunggu_ditimbang: "menunggu_ditimbang";
        sedang_diproses: "sedang_diproses";
        siap_diambil: "siap_diambil";
        selesai: "selesai";
    }>>;
    date: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const scanQrSchema: z.ZodObject<{
    qr_code: z.ZodString;
}, z.core.$strip>;
export declare const timbangSchema: z.ZodObject<{
    berat_aktual: z.ZodNumber;
    foto_timbangan: z.ZodString;
}, z.core.$strip>;
export declare const updateStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        sedang_diproses: "sedang_diproses";
        siap_diambil: "siap_diambil";
        selesai: "selesai";
    }>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const walkinOrderSchema: z.ZodObject<{
    customer_nama: z.ZodString;
    customer_telepon: z.ZodString;
    tipe_layanan: z.ZodEnum<{
        per_kg: "per_kg";
        per_item: "per_item";
    }>;
    jenis_layanan_id: z.ZodOptional<z.ZodString>;
    durasi_layanan_id: z.ZodOptional<z.ZodString>;
    parfum_id: z.ZodOptional<z.ZodString>;
    berat_aktual: z.ZodOptional<z.ZodNumber>;
    foto_timbangan: z.ZodOptional<z.ZodString>;
    special_notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=order.schema.d.ts.map