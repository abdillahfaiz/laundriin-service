import { JwtPayload } from "../../../middlewares/auth.middleware";
import { Decimal } from "@prisma/client/runtime/library";
export declare const getOrders: (outletId: string, status: string | undefined, date: string | undefined) => Promise<({
    customer: {
        nama: string;
        nomor_telepon: string;
    };
    jenis_layanan: {
        nama: string;
    } | null;
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_estimasi: Decimal | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    harga_estimasi: Decimal | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
})[]>;
export declare const getOrderById: (orderId: string, outletId: string) => Promise<{
    customer: {
        nama: string;
        nomor_telepon: string;
    };
    status_logs: ({
        user: {
            role: import(".prisma/client").$Enums.Role;
            nama: string;
        };
    } & {
        id: string;
        created_at: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        note: string | null;
        changed_by: string;
        order_id: string;
    })[];
    parfum: {
        nama: string;
        harga: Decimal;
    } | null;
    payment: {
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
    } | null;
    jenis_layanan: {
        nama: string;
    } | null;
    durasi_layanan: {
        nama: string;
        estimasi_jam: number;
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
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_estimasi: Decimal | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    harga_estimasi: Decimal | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
}>;
export declare const scanQR: (qrCode: string, outletId: string) => Promise<{
    customer: {
        nama: string;
        nomor_telepon: string;
    };
    parfum: {
        nama: string;
    } | null;
    jenis_layanan: {
        nama: string;
    } | null;
    durasi_layanan: {
        nama: string;
        estimasi_jam: number;
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
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_estimasi: Decimal | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    harga_estimasi: Decimal | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
}>;
export declare const timbangOrder: (orderId: string, beratAktual: number, fotoTimbangan: string, user: JwtPayload) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_estimasi: Decimal | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    harga_estimasi: Decimal | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
}>;
export declare const updateOrderStatus: (orderId: string, newStatus: string, note: string | undefined, user: JwtPayload) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_estimasi: Decimal | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    harga_estimasi: Decimal | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
}>;
export declare const createWalkinOrder: (body: any, user: JwtPayload) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_estimasi: Decimal | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    harga_estimasi: Decimal | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
}>;
//# sourceMappingURL=order.service.d.ts.map