import { z } from "zod/v4";

export const coverageSchema = z.object({
  nama_area: z.string().min(2).max(100),
  max_radius_km: z.number().min(0.1),
  ongkos_kirim: z.number().min(0),
});
