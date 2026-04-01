import { JwtPayload } from "../../../middlewares/auth.middleware";
import { Decimal } from "@prisma/client/runtime/library";
export declare const createOrder: (body: any, user: JwtPayload) => Promise<({
    outlet: {
        nama_outlet: string;
    };
    parfum: {
        nama: string;
        harga: Decimal;
    } | null;
    jenis_layanan: {
        nama: string;
    } | null;
    durasi_layanan: {
        nama: string;
        estimasi_jam: number;
        harga: Decimal;
    } | null;
    pickup: {
        id: string;
        created_at: Date;
        updated_at: Date;
        ongkos_kirim: Decimal;
        alamat_pickup: string;
        lat_pickup: number;
        lng_pickup: number;
        alamat_antar: string | null;
        lat_antar: number | null;
        lng_antar: number | null;
        jadwal_jemput: Date;
        foto_barang_pickup: string | null;
        catatan_alamat: string | null;
        kurir_id: string | null;
        order_id: string;
    } | null;
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    tipe_layanan: import(".prisma/client").$Enums.TipeLayanan;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
}) | ({
    outlet: {
        nama_outlet: string;
    };
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
            estimasi_jam: number;
        };
    } & {
        id: string;
        item_layanan_id: string;
        jenis_per_item_id: string;
        order_id: string;
        durasi_per_item_id: string;
        qty: number;
        harga_satuan: Decimal;
        subtotal: Decimal;
    })[];
    pickup: {
        id: string;
        created_at: Date;
        updated_at: Date;
        ongkos_kirim: Decimal;
        alamat_pickup: string;
        lat_pickup: number;
        lng_pickup: number;
        alamat_antar: string | null;
        lat_antar: number | null;
        lng_antar: number | null;
        jadwal_jemput: Date;
        foto_barang_pickup: string | null;
        catatan_alamat: string | null;
        kurir_id: string | null;
        order_id: string;
    } | null;
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    tipe_layanan: import(".prisma/client").$Enums.TipeLayanan;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
})>;
export declare const getActiveOrders: (userId: string) => Promise<({
    outlet: {
        nama_outlet: string;
    };
    payment: {
        status: import(".prisma/client").$Enums.PaymentStatus;
    } | null;
    jenis_layanan: {
        nama: string;
    } | null;
    pickup: {
        alamat_pickup: string;
        jadwal_jemput: Date;
    } | null;
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    tipe_layanan: import(".prisma/client").$Enums.TipeLayanan;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
})[]>;
export declare const getOrderHistory: (userId: string, page?: number, limit?: number) => Promise<{
    data: ({
        outlet: {
            nama_outlet: string;
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
        tipe_layanan: import(".prisma/client").$Enums.TipeLayanan;
        jenis_order: import(".prisma/client").$Enums.JenisOrder;
        special_notes: string | null;
        berat_aktual: Decimal | null;
        foto_timbangan: string | null;
        total_harga_final: Decimal | null;
        is_walkin: boolean;
        qr_code: string | null;
        customer_id: string;
        kasir_id: string | null;
        durasi_layanan_id: string | null;
        parfum_id: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getOrderById: (orderId: string, userId: string) => Promise<{
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
    outlet: {
        nama_outlet: string;
        alamat: string;
    };
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
            estimasi_jam: number;
        };
    } & {
        id: string;
        item_layanan_id: string;
        jenis_per_item_id: string;
        order_id: string;
        durasi_per_item_id: string;
        qty: number;
        harga_satuan: Decimal;
        subtotal: Decimal;
    })[];
    pickup: {
        id: string;
        created_at: Date;
        updated_at: Date;
        ongkos_kirim: Decimal;
        alamat_pickup: string;
        lat_pickup: number;
        lng_pickup: number;
        alamat_antar: string | null;
        lat_antar: number | null;
        lng_antar: number | null;
        jadwal_jemput: Date;
        foto_barang_pickup: string | null;
        catatan_alamat: string | null;
        kurir_id: string | null;
        order_id: string;
    } | null;
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.OrderStatus;
    outlet_id: string;
    jenis_layanan_id: string | null;
    transaction_id: string;
    tipe_layanan: import(".prisma/client").$Enums.TipeLayanan;
    jenis_order: import(".prisma/client").$Enums.JenisOrder;
    special_notes: string | null;
    berat_aktual: Decimal | null;
    foto_timbangan: string | null;
    total_harga_final: Decimal | null;
    is_walkin: boolean;
    qr_code: string | null;
    customer_id: string;
    kasir_id: string | null;
    durasi_layanan_id: string | null;
    parfum_id: string | null;
}>;
export declare const getOrderQR: (orderId: string, userId: string) => Promise<{
    transaction_id: string;
    qr_code: string | null;
}>;
//# sourceMappingURL=order.service.d.ts.map