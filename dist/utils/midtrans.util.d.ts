export interface MidtransResponse {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_status: string;
    va_numbers?: Array<{
        bank: string;
        va_number: string;
    }>;
    actions?: Array<{
        name: string;
        method: string;
        url: string;
    }>;
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
 * Create payment charge via Midtrans Core API
 */
export declare const createMidtransPayment: (orderId: string, amount: number, metode: string) => Promise<MidtransResponse>;
/**
 * Check payment status from Midtrans
 */
export declare const checkMidtransStatus: (midtransOrderId: string) => Promise<MidtransStatusResponse>;
/**
 * Verify Midtrans webhook signature
 * Formula: SHA512(order_id + status_code + gross_amount + SERVER_KEY)
 */
export declare const verifyMidtransSignature: (orderId: string, statusCode: string, grossAmount: string) => string;
//# sourceMappingURL=midtrans.util.d.ts.map