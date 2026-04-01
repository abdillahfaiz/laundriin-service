export declare const getProfile: (outletId: string) => Promise<{
    admin: {
        nama: string;
        nomor_telepon: string;
    };
} & {
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
export declare const updateProfile: (outletId: string, data: any) => Promise<{
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
export declare const getOperasional: (outletId: string) => Promise<{
    id: string;
    outlet_id: string;
    hari: import(".prisma/client").$Enums.HariEnum;
    jam_buka: string;
    jam_tutup: string;
    is_open: boolean;
}[]>;
export declare const updateOperasional: (outletId: string, data: any[]) => Promise<{
    id: string;
    outlet_id: string;
    hari: import(".prisma/client").$Enums.HariEnum;
    jam_buka: string;
    jam_tutup: string;
    is_open: boolean;
}[]>;
//# sourceMappingURL=profile.service.d.ts.map