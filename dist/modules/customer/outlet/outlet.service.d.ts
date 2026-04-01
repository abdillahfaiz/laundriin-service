export declare const getNearbyOutlets: (lat: number, lng: number, radius: number, page?: number, limit?: number) => Promise<{
    data: {
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
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
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
export declare const getLayananPerKg: (outletId: string) => Promise<{
    id: string;
    nama: string;
    deskripsi: string | null;
}[]>;
export declare const getDurasiPerKg: (outletId: string, jenisLayananId: string) => Promise<{
    id: string;
    nama: string;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
}[]>;
export declare const getItemsPerItem: (outletId: string) => Promise<{
    id: string;
    nama_item: string;
    foto_item: string | null;
}[]>;
export declare const getJenisPerItem: (outletId: string, itemId: string) => Promise<{
    id: string;
    nama: string;
    deskripsi: string | null;
}[]>;
export declare const getDurasiPerItem: (outletId: string, jenisId: string) => Promise<{
    id: string;
    nama: string;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
}[]>;
export declare const getParfumByOutlet: (outletId: string) => Promise<{
    id: string;
    nama: string;
    harga: import("@prisma/client/runtime/library").Decimal;
}[]>;
export declare const getCoverage: (outletId: string, lat: number, lng: number) => Promise<{
    is_covered: boolean;
    jarak_km: number;
    coverage: null;
    message: string;
} | {
    is_covered: boolean;
    jarak_km: number;
    coverage: {
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        outlet_id: string;
        nama_area: string;
        max_radius_km: number;
        ongkos_kirim: import("@prisma/client/runtime/library").Decimal;
    };
    message?: undefined;
}>;
//# sourceMappingURL=outlet.service.d.ts.map