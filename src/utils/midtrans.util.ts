import axios from "axios";
import crypto from "crypto";
import { env } from "../config/env";

const MIDTRANS_BASE_URL = "https://api.sandbox.midtrans.com/v2";

const AUTH_HEADER = "Basic " + Buffer.from(env.MIDTRANS_SERVER_KEY + ":").toString("base64");

export interface MidtransResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  va_numbers?: Array<{ bank: string; va_number: string }>;
  actions?: Array<{ name: string; method: string; url: string }>;
  expiry_time?: string;
  [key: string]: any;
}

export interface MidtransStatusResponse {
  status_code: string;
  transaction_status: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  signature_key: string;
  [key: string]: any;
}

/**
 * Build Midtrans payment request body based on payment method
 */
const buildPaymentBody = (orderId: string, amount: number, metode: string) => {
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
export const createMidtransPayment = async (
  orderId: string,
  amount: number,
  metode: string
): Promise<MidtransResponse> => {
  const body = buildPaymentBody(orderId, amount, metode);

  const response = await axios.post<MidtransResponse>(
    `${MIDTRANS_BASE_URL}/charge`,
    body,
    {
      headers: {
        Authorization: AUTH_HEADER,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};

/**
 * Check payment status from Midtrans
 */
export const checkMidtransStatus = async (
  midtransOrderId: string
): Promise<MidtransStatusResponse> => {
  const response = await axios.get<MidtransStatusResponse>(
    `${MIDTRANS_BASE_URL}/${midtransOrderId}/status`,
    {
      headers: {
        Authorization: AUTH_HEADER,
        Accept: "application/json",
      },
    }
  );

  return response.data;
};

/**
 * Verify Midtrans webhook signature
 * Formula: SHA512(order_id + status_code + gross_amount + SERVER_KEY)
 */
export const verifyMidtransSignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string
): string => {
  const payload = orderId + statusCode + grossAmount + env.MIDTRANS_SERVER_KEY;
  return crypto.createHash("sha512").update(payload).digest("hex");
};
