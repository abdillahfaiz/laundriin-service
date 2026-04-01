import { JwtPayload } from "../../../middlewares/auth.middleware";
import { Decimal } from "@prisma/client/runtime/library";
export declare const getOrders: (outletId: string, query: {
    status?: string;
    tipe_layanan?: string;
    jenis_order?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: ({
        customer: {
            nama: string;
            nomor_telepon: string;
        };
        payment: {
            status: import(".prisma/client").$Enums.PaymentStatus;
        } | null;
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
export declare const scanQR: (qrCode: string, outletId: string) => Promise<{
    customer: {
        nama: string;
        nomor_telepon: string;
    };
    parfum: {
        nama: string;
    } | null;
    payment: {
        status: import(".prisma/client").$Enums.PaymentStatus;
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
        item_layanan_id: string;
        jenis_per_item_id: string;
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
export declare const timbangOrder: (orderId: string, beratAktual: number, fotoTimbangan: string, user: JwtPayload) => Promise<{
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
export declare const updateOrderStatus: (orderId: string, newStatus: string, note: string | undefined, user: JwtPayload) => Promise<{
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
export declare const createWalkinOrder: (body: any, user: JwtPayload) => Promise<{
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
export declare const getPickupOrders: (outletId: string) => Promise<({
    customer: {
        nama: string;
        nomor_telepon: string;
    };
    payment: {
        status: import(".prisma/client").$Enums.PaymentStatus;
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
})[]>;
export declare const konfirmasiPickup: (orderId: string, kurirId: string, user: JwtPayload) => Promise<{
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
export declare const pickupBerangkat: (orderId: string, user: JwtPayload) => Promise<{
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
export declare const pickupDijemput: (orderId: string, fotoBarangPickup: string, user: JwtPayload) => Promise<{
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
export declare const pickupDiantar: (orderId: string, user: JwtPayload) => Promise<{
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
export declare const pickupSelesaiAntar: (orderId: string, user: JwtPayload) => Promise<{
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
//# sourceMappingURL=order.service.d.ts.map