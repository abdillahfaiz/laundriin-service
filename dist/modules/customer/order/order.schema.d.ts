import { z } from "zod/v4";
export declare const createOrderPerKgSchema: z.ZodObject<{
    outlet_id: z.ZodString;
    tipe_layanan: z.ZodLiteral<"per_kg">;
    jenis_layanan_id: z.ZodString;
    durasi_layanan_id: z.ZodString;
    parfum_id: z.ZodOptional<z.ZodString>;
    special_notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createOrderPerItemSchema: z.ZodObject<{
    outlet_id: z.ZodString;
    tipe_layanan: z.ZodLiteral<"per_item">;
    parfum_id: z.ZodOptional<z.ZodString>;
    special_notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        item_layanan_id: z.ZodString;
        durasi_layanan_id: z.ZodString;
        qty: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createOrderSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outlet_id: z.ZodString;
    tipe_layanan: z.ZodLiteral<"per_kg">;
    jenis_layanan_id: z.ZodString;
    durasi_layanan_id: z.ZodString;
    parfum_id: z.ZodOptional<z.ZodString>;
    special_notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    outlet_id: z.ZodString;
    tipe_layanan: z.ZodLiteral<"per_item">;
    parfum_id: z.ZodOptional<z.ZodString>;
    special_notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        item_layanan_id: z.ZodString;
        durasi_layanan_id: z.ZodString;
        qty: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>], "tipe_layanan">;
//# sourceMappingURL=order.schema.d.ts.map