import { z } from "zod/v4";

export const outletOrderQuerySchema = z.object({
  status: z.enum([
    "menunggu_drop", "menunggu_ditimbang", "sedang_diproses",
    "siap_diambil", "selesai", "dibatalkan",
    "menunggu_konfirmasi", "dikonfirmasi", "kurir_menuju",
    "barang_dijemput", "siap_diantar", "sedang_diantar",
  ]).optional(),
  tipe_layanan: z.enum(["per_kg", "per_item"]).optional(),
  jenis_order: z.enum(["drop_and_go", "antar_jemput"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const scanQrSchema = z.object({
  qr_code: z.string().min(1),
});

export const timbangSchema = z.object({
  berat_aktual: z.number().min(0.1).max(100),
  foto_timbangan: z.string().min(1),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "menunggu_ditimbang", "sedang_diproses",
    "siap_diambil", "selesai", "dibatalkan",
    "dikonfirmasi", "kurir_menuju", "barang_dijemput",
    "siap_diantar", "sedang_diantar",
  ]),
  note: z.string().optional(),
});

export const walkinOrderSchema = z.object({
  customer_nama: z.string().min(2).max(100),
  customer_telepon: z.string().regex(/^08[0-9]{8,11}$/, "Format nomor tidak valid"),
  tipe_layanan: z.enum(["per_kg", "per_item"]),
  jenis_layanan_id: z.string().uuid().optional(),
  durasi_layanan_id: z.string().uuid().optional(),
  parfum_id: z.string().uuid().optional(),
  berat_aktual: z.number().min(0.1).max(100).optional(),
  foto_timbangan: z.string().optional(),
  special_notes: z.string().max(500).optional(),
  // Per item walk-in
  items: z.array(z.object({
    item_layanan_id: z.string().uuid(),
    jenis_per_item_id: z.string().uuid(),
    durasi_per_item_id: z.string().uuid(),
    qty: z.number().int().min(1).max(100),
  })).optional(),
});

export const konfirmasiPickupSchema = z.object({
  kurir_id: z.string().uuid(),
});

export const dijemputSchema = z.object({
  foto_barang_pickup: z.string().min(1, "Foto barang pickup WAJIB disertakan"),
});
