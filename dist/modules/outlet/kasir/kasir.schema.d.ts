import { z } from "zod/v4";
export declare const createKasirSchema: z.ZodObject<{
    nama: z.ZodString;
    nomor_telepon: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const updateKasirSchema: z.ZodObject<{
    nama: z.ZodOptional<z.ZodString>;
    nomor_telepon: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=kasir.schema.d.ts.map