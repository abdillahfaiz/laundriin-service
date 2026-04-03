import { z } from "zod/v4";

export const jenisLayananSchema = z.object({
  nama: z.string().min(3).max(100),
  deskripsi: z.string().max(500).optional(),
  // NO 'tipe' field — JenisLayanan is implicitly per_kg only
});

export const durasiLayananSchema = z.object({
  // jenis_layanan_id comes from route params, NOT body
  nama: z.string().min(2).max(100),
  estimasi_jam: z.number().int().min(1),
  harga: z.number().min(0),
});

export const itemLayananSchema = z.object({
  nama_item: z.string().min(2).max(100),
  foto_item: z.string().nullable(),
});

export const jenisPerItemSchema = z.object({
  nama: z.string().min(2).max(100),
  deskripsi: z.string().max(500).optional(),
});

export const durasiPerItemSchema = z.object({
  nama: z.string().min(2).max(100),
  estimasi_jam: z.number().int().min(1),
  harga: z.number().min(0),
});

export const parfumSchema = z.object({
  nama: z.string().min(2).max(100),
  harga: z.number().min(0),
});
