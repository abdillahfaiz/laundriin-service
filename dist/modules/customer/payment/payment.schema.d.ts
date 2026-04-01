import { z } from "zod/v4";
export declare const createPaymentSchema: z.ZodObject<{
    metode_pembayaran: z.ZodEnum<{
        gopay: "gopay";
        qris: "qris";
        shopeepay: "shopeepay";
        bca_va: "bca_va";
        bni_va: "bni_va";
        bri_va: "bri_va";
        mandiri_va: "mandiri_va";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=payment.schema.d.ts.map