import { z } from "zod/v4";
export declare const outletOrderQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        menunggu_ditimbang: "menunggu_ditimbang";
        sedang_diproses: "sedang_diproses";
        selesai: "selesai";
        dibatalkan: "dibatalkan";
        menunggu_drop: "menunggu_drop";
        siap_diambil: "siap_diambil";
        menunggu_konfirmasi: "menunggu_konfirmasi";
        dikonfirmasi: "dikonfirmasi";
        kurir_menuju: "kurir_menuju";
        barang_dijemput: "barang_dijemput";
        siap_diantar: "siap_diantar";
        sedang_diantar: "sedang_diantar";
    }>>;
    tipe_layanan: z.ZodOptional<z.ZodEnum<{
        per_kg: "per_kg";
        per_item: "per_item";
    }>>;
    jenis_order: z.ZodOptional<z.ZodEnum<{
        drop_and_go: "drop_and_go";
        antar_jemput: "antar_jemput";
    }>>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
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
        menunggu_ditimbang: "menunggu_ditimbang";
        sedang_diproses: "sedang_diproses";
        selesai: "selesai";
        dibatalkan: "dibatalkan";
        siap_diambil: "siap_diambil";
        dikonfirmasi: "dikonfirmasi";
        kurir_menuju: "kurir_menuju";
        barang_dijemput: "barang_dijemput";
        siap_diantar: "siap_diantar";
        sedang_diantar: "sedang_diantar";
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
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        item_layanan_id: z.ZodString;
        jenis_per_item_id: z.ZodString;
        durasi_per_item_id: z.ZodString;
        qty: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const konfirmasiPickupSchema: z.ZodObject<{
    kurir_id: z.ZodString;
}, z.core.$strip>;
export declare const dijemputSchema: z.ZodObject<{
    foto_barang_pickup: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=order.schema.d.ts.map