import { z } from "zod/v4";

export const createOrderPerKgSchema = z.object({
  outlet_id: z.string().uuid(),
  tipe_layanan: z.literal("per_kg"),
  jenis_order: z.enum(["drop_and_go", "antar_jemput"]),
  jenis_layanan_id: z.string().uuid(),
  durasi_layanan_id: z.string().uuid(),
  parfum_id: z.string().uuid().optional(),
  special_notes: z.string().max(500).optional(),
  pickup: z.object({
    alamat_pickup: z.string().min(10),
    lat_pickup: z.number().min(-90).max(90),
    lng_pickup: z.number().min(-180).max(180),
    alamat_antar: z.string().optional(),
    lat_antar: z.number().optional(),
    lng_antar: z.number().optional(),
    jadwal_jemput: z.string().datetime(),
    catatan_alamat: z.string().max(200).optional(),
  }).optional(), // required only if jenis_order === 'antar_jemput'
});

export const createOrderPerItemSchema = z.object({
  outlet_id: z.string().uuid(),
  tipe_layanan: z.literal("per_item"),
  jenis_order: z.enum(["drop_and_go", "antar_jemput"]),
  parfum_id: z.string().uuid().optional(),
  special_notes: z.string().max(500).optional(),
  items: z.array(z.object({
    item_layanan_id: z.string().uuid(),
    jenis_per_item_id: z.string().uuid(),   // WAJIB
    durasi_per_item_id: z.string().uuid(),  // WAJIB
    qty: z.number().int().min(1).max(100),
  })).min(1),
  pickup: z.object({
    alamat_pickup: z.string().min(10),
    lat_pickup: z.number().min(-90).max(90),
    lng_pickup: z.number().min(-180).max(180),
    alamat_antar: z.string().optional(),
    lat_antar: z.number().optional(),
    lng_antar: z.number().optional(),
    jadwal_jemput: z.string().datetime(),
    catatan_alamat: z.string().max(200).optional(),
  }).optional(), // required only if jenis_order === 'antar_jemput'
});

export const createOrderSchema = z.discriminatedUnion("tipe_layanan", [
  createOrderPerKgSchema,
  createOrderPerItemSchema,
]);
