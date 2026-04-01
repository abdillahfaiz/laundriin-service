import { z } from "zod/v4";

export const createPaymentSchema = z.object({
  metode_pembayaran: z.enum([
    "bca_va", "bni_va", "bri_va", "mandiri_va",
    "qris", "gopay", "shopeepay",
  ]),
});
