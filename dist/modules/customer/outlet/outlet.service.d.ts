export declare const getNearbyOutlets: (lat: number, lng: number, radius: number) => Promise<{
    id: string;
    nama_outlet: string;
    alamat: string;
    foto_outlet: string | null;
    lat: import("@prisma/client/runtime/library").Decimal;
    lng: import("@prisma/client/runtime/library").Decimal;
    jarak_km: number;
    is_buka: boolean;
    operasional: {
        id: string;
        outlet_id: string;
        hari: import(".prisma/client").$Enums.HariEnum;
        jam_buka: string;
        jam_tutup: string;
        is_open: boolean;
    }[];
}[]>;
export declare const getOutletById: (outletId: string) => Promise<{
    is_buka: boolean;
    operasional: {
        id: string;
        outlet_id: string;
        hari: import(".prisma/client").$Enums.HariEnum;
        jam_buka: string;
        jam_tutup: string;
        is_open: boolean;
    }[];
    id: string;
    created_at: Date;
    updated_at: Date;
    nama_outlet: string;
    alamat: string;
    foto_outlet: string | null;
    lat: import("@prisma/client/runtime/library").Decimal;
    lng: import("@prisma/client/runtime/library").Decimal;
    status: import(".prisma/client").$Enums.OutletStatus;
    saldo: import("@prisma/client/runtime/library").Decimal;
    admin_id: string;
}>;
export declare const getOutletLayanan: (outletId: string) => Promise<{
    id: string;
    nama: string;
    deskripsi: string | null;
}[]>;
export declare const getDurasiByJenisLayanan: (outletId: string, jenisLayananId: string) => Promise<{
    id: string;
    nama: string;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
}[]>;
export declare const getItemsByJenisLayanan: (outletId: string, jenisLayananId: string) => Promise<never>;
export declare const getParfumByOutlet: (outletId: string) => Promise<{
    id: string;
    nama: string;
    harga: import("@prisma/client/runtime/library").Decimal;
}[]>;
export declare const getAllItems: (outletId: string) => Promise<({
    jenis_per_item: ({
        durasi_per_item: {
            id: string;
            nama: string;
            estimasi_jam: number;
            harga: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        nama: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deskripsi: string | null;
        item_layanan_id: string;
    })[];
} & {
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    nama_item: string;
    foto_item: string | null;
})[]>;
export declare const getJenisLayananByItem: (outletId: string, itemId: string) => Promise<{
    jenis_per_item: ({
        durasi_per_item: {
            id: string;
            nama: string;
            estimasi_jam: number;
            harga: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        nama: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deskripsi: string | null;
        item_layanan_id: string;
    })[];
} & {
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    nama_item: string;
    foto_item: string | null;
}>;
//# sourceMappingURL=outlet.service.d.ts.map