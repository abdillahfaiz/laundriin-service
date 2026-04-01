import { z } from "zod/v4";
export declare const createOrderPerKgSchema: z.ZodObject<{
    outlet_id: z.ZodString;
    tipe_layanan: z.ZodLiteral<"per_kg">;
    jenis_order: z.ZodEnum<{
        drop_and_go: "drop_and_go";
        antar_jemput: "antar_jemput";
    }>;
    jenis_layanan_id: z.ZodString;
    durasi_layanan_id: z.ZodString;
    parfum_id: z.ZodOptional<z.ZodString>;
    special_notes: z.ZodOptional<z.ZodString>;
    pickup: z.ZodOptional<z.ZodObject<{
        alamat_pickup: z.ZodString;
        lat_pickup: z.ZodNumber;
        lng_pickup: z.ZodNumber;
        alamat_antar: z.ZodOptional<z.ZodString>;
        lat_antar: z.ZodOptional<z.ZodNumber>;
        lng_antar: z.ZodOptional<z.ZodNumber>;
        jadwal_jemput: z.ZodString;
        catatan_alamat: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createOrderPerItemSchema: z.ZodObject<{
    outlet_id: z.ZodString;
    tipe_layanan: z.ZodLiteral<"per_item">;
    jenis_order: z.ZodEnum<{
        drop_and_go: "drop_and_go";
        antar_jemput: "antar_jemput";
    }>;
    parfum_id: z.ZodOptional<z.ZodString>;
    special_notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        item_layanan_id: z.ZodString;
        jenis_per_item_id: z.ZodString;
        durasi_per_item_id: z.ZodString;
        qty: z.ZodNumber;
    }, z.core.$strip>>;
    pickup: z.ZodOptional<z.ZodObject<{
        alamat_pickup: z.ZodString;
        lat_pickup: z.ZodNumber;
        lng_pickup: z.ZodNumber;
        alamat_antar: z.ZodOptional<z.ZodString>;
        lat_antar: z.ZodOptional<z.ZodNumber>;
        lng_antar: z.ZodOptional<z.ZodNumber>;
        jadwal_jemput: z.ZodString;
        catatan_alamat: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createOrderSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outlet_id: z.ZodString;
    tipe_layanan: z.ZodLiteral<"per_kg">;
    jenis_order: z.ZodEnum<{
        drop_and_go: "drop_and_go";
        antar_jemput: "antar_jemput";
    }>;
    jenis_layanan_id: z.ZodString;
    durasi_layanan_id: z.ZodString;
    parfum_id: z.ZodOptional<z.ZodString>;
    special_notes: z.ZodOptional<z.ZodString>;
    pickup: z.ZodOptional<z.ZodObject<{
        alamat_pickup: z.ZodString;
        lat_pickup: z.ZodNumber;
        lng_pickup: z.ZodNumber;
        alamat_antar: z.ZodOptional<z.ZodString>;
        lat_antar: z.ZodOptional<z.ZodNumber>;
        lng_antar: z.ZodOptional<z.ZodNumber>;
        jadwal_jemput: z.ZodString;
        catatan_alamat: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    outlet_id: z.ZodString;
    tipe_layanan: z.ZodLiteral<"per_item">;
    jenis_order: z.ZodEnum<{
        drop_and_go: "drop_and_go";
        antar_jemput: "antar_jemput";
    }>;
    parfum_id: z.ZodOptional<z.ZodString>;
    special_notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        item_layanan_id: z.ZodString;
        jenis_per_item_id: z.ZodString;
        durasi_per_item_id: z.ZodString;
        qty: z.ZodNumber;
    }, z.core.$strip>>;
    pickup: z.ZodOptional<z.ZodObject<{
        alamat_pickup: z.ZodString;
        lat_pickup: z.ZodNumber;
        lng_pickup: z.ZodNumber;
        alamat_antar: z.ZodOptional<z.ZodString>;
        lat_antar: z.ZodOptional<z.ZodNumber>;
        lng_antar: z.ZodOptional<z.ZodNumber>;
        jadwal_jemput: z.ZodString;
        catatan_alamat: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>], "tipe_layanan">;
//# sourceMappingURL=order.schema.d.ts.map