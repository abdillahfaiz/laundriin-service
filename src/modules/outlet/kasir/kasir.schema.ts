import { z } from "zod/v4";

export const createKasirSchema = z.object({
  nama: z.string().min(2).max(100),
  nomor_telepon: z.string().regex(/^08[0-9]{8,11}$/, "Format nomor tidak valid"),
  password: z.string().min(8).max(100),
});

export const updateKasirSchema = z.object({
  nama: z.string().min(2).max(100).optional(),
  nomor_telepon: z.string().regex(/^08[0-9]{8,11}$/, "Format nomor tidak valid").optional(),
});
