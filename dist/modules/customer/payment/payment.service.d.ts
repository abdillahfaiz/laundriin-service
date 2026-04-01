import { Decimal } from "@prisma/client/runtime/library";
export declare const getTagihan: (orderId: string, userId: string) => Promise<{
    order_id: string;
    transaction_id: string;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    berat_aktual: Decimal | null;
    total_harga_final: Decimal | null;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet: {
        nama_outlet: string;
    };
    jenis_layanan: {
        nama: string;
    } | null;
    durasi_layanan: {
        nama: string;
        harga: Decimal;
    } | null;
    parfum: {
        nama: string;
        harga: Decimal;
    } | null;
    order_items: ({
        item_layanan: {
            nama_item: string;
        };
        jenis_per_item: {
            nama: string;
        };
        durasi_per_item: {
            nama: string;
        };
    } & {
        id: string;
        jenis_per_item_id: string;
        item_layanan_id: string;
        order_id: string;
        durasi_per_item_id: string;
        qty: number;
        harga_satuan: Decimal;
        subtotal: Decimal;
    })[];
}>;
export declare const createPayment: (orderId: string, userId: string, metodePembayaran: string) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.PaymentStatus;
    order_id: string;
    midtrans_order_id: string;
    metode_pembayaran: string;
    va_number: string | null;
    qris_url: string | null;
    total_bayar: Decimal;
    expired_at: Date | null;
    paid_at: Date | null;
    midtrans_response: import("@prisma/client/runtime/library").JsonValue | null;
}>;
export declare const getPaymentDetail: (orderId: string, userId: string) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.PaymentStatus;
    order_id: string;
    midtrans_order_id: string;
    metode_pembayaran: string;
    va_number: string | null;
    qris_url: string | null;
    total_bayar: Decimal;
    expired_at: Date | null;
    paid_at: Date | null;
    midtrans_response: import("@prisma/client/runtime/library").JsonValue | null;
}>;
export declare const checkPaymentStatus: (orderId: string, userId: string) => Promise<{
    payment_status: string;
    order_status: import(".prisma/client").$Enums.OrderStatus;
    midtrans_response: import("../../../utils/midtrans.util").MidtransStatusResponse;
}>;
//# sourceMappingURL=payment.service.d.ts.map