"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMidtransSignature = exports.checkMidtransStatus = exports.createMidtransPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const MIDTRANS_BASE_URL = "https://api.sandbox.midtrans.com/v2";
const AUTH_HEADER = "Basic " + Buffer.from(env_1.env.MIDTRANS_SERVER_KEY + ":").toString("base64");
/**
 * Build Midtrans payment request body based on payment method
 */
const buildPaymentBody = (orderId, amount, metode) => {
    const base = {
        transaction_details: {
            order_id: orderId,
            gross_amount: amount,
        },
    };
    switch (metode) {
        case "bca_va":
            return { ...base, payment_type: "bank_transfer", bank_transfer: { bank: "bca" } };
        case "bni_va":
            return { ...base, payment_type: "bank_transfer", bank_transfer: { bank: "bni" } };
        case "bri_va":
            return { ...base, payment_type: "bank_transfer", bank_transfer: { bank: "bri" } };
        case "mandiri_va":
            return { ...base, payment_type: "bank_transfer", bank_transfer: { bank: "mandiri" } };
        case "gopay":
            return { ...base, payment_type: "gopay" };
        case "qris":
            return { ...base, payment_type: "qris", qris: { acquirer: "gopay" } };
        case "shopeepay":
            return { ...base, payment_type: "shopeepay" };
        default:
            throw new Error(`Metode pembayaran tidak didukung: ${metode}`);
    }
};
/**
 * Create payment charge via Midtrans Core API
 */
const createMidtransPayment = async (orderId, amount, metode) => {
    const body = buildPaymentBody(orderId, amount, metode);
    const response = await axios_1.default.post(`${MIDTRANS_BASE_URL}/charge`, body, {
        headers: {
            Authorization: AUTH_HEADER,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
    return response.data;
};
exports.createMidtransPayment = createMidtransPayment;
/**
 * Check payment status from Midtrans
 */
const checkMidtransStatus = async (midtransOrderId) => {
    const response = await axios_1.default.get(`${MIDTRANS_BASE_URL}/${midtransOrderId}/status`, {
        headers: {
            Authorization: AUTH_HEADER,
            Accept: "application/json",
        },
    });
    return response.data;
};
exports.checkMidtransStatus = checkMidtransStatus;
/**
 * Verify Midtrans webhook signature
 * Formula: SHA512(order_id + status_code + gross_amount + SERVER_KEY)
 */
const verifyMidtransSignature = (orderId, statusCode, grossAmount) => {
    const payload = orderId + statusCode + grossAmount + env_1.env.MIDTRANS_SERVER_KEY;
    return crypto_1.default.createHash("sha512").update(payload).digest("hex");
};
exports.verifyMidtransSignature = verifyMidtransSignature;
//# sourceMappingURL=midtrans.util.js.map