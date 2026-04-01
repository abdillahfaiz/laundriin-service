import { z } from "zod/v4";
export declare const jenisLayananSchema: z.ZodObject<{
    nama: z.ZodString;
    deskripsi: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const durasiLayananSchema: z.ZodObject<{
    jenis_layanan_id: z.ZodString;
    nama: z.ZodString;
    estimasi_jam: z.ZodNumber;
    harga: z.ZodNumber;
}, z.core.$strip>;
export declare const itemLayananSchema: z.ZodObject<{
    nama_item: z.ZodString;
    foto_item: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const jenisPerItemSchema: z.ZodObject<{
    nama: z.ZodString;
    deskripsi: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const durasiPerItemSchema: z.ZodObject<{
    nama: z.ZodString;
    estimasi_jam: z.ZodNumber;
    harga: z.ZodNumber;
}, z.core.$strip>;
export declare const parfumSchema: z.ZodObject<{
    nama: z.ZodString;
    harga: z.ZodNumber;
}, z.core.$strip>;
//# sourceMappingURL=layanan.schema.d.ts.map