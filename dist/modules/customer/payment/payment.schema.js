"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSchema = void 0;
const v4_1 = require("zod/v4");
exports.createPaymentSchema = v4_1.z.object({
    metode_pembayaran: v4_1.z.enum([
        "bca_va", "bni_va", "bri_va", "mandiri_va",
        "qris", "gopay", "shopeepay",
    ]),
});
//# sourceMappingURL=payment.schema.js.map