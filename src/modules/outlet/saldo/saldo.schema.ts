import { z } from "zod/v4";

export const pencairanSchema = z.object({
  jumlah: z.number().min(50000, "Minimum pencairan Rp 50.000"),
  nomor_rekening: z.string().min(5).max(50),
  nama_pemilik_rekening: z.string().min(2).max(100),
  bank_tujuan: z.string().min(2).max(50),
});
