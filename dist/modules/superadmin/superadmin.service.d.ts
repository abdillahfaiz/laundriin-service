import { Decimal } from "@prisma/client/runtime/library";
export declare const getDashboard: () => Promise<{
    total_outlets: number;
    active_outlets: number;
    total_orders: number;
    total_users: number;
    total_transaksi: number;
}>;
export declare const getOutlets: () => Promise<({
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
    lat: Decimal;
    lng: Decimal;
    status: import(".prisma/client").$Enums.OutletStatus;
    saldo: Decimal;
    admin_id: string;
})[]>;
export declare const getOutletById: (outletId: string) => Promise<{
    _count: {
        kasir: number;
        orders: number;
    };
    admin: {
        nama: string;
        nomor_telepon: string;
    };
    operasional: {
        id: string;
        outlet_id: string;
        hari: import(".prisma/client").$Enums.HariEnum;
        jam_buka: string;
        jam_tutup: string;
        is_open: boolean;
    }[];
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    nama_outlet: string;
    alamat: string;
    foto_outlet: string | null;
    lat: Decimal;
    lng: Decimal;
    status: import(".prisma/client").$Enums.OutletStatus;
    saldo: Decimal;
    admin_id: string;
}>;
export declare const updateOutletStatus: (outletId: string, status: string) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    nama_outlet: string;
    alamat: string;
    foto_outlet: string | null;
    lat: Decimal;
    lng: Decimal;
    status: import(".prisma/client").$Enums.OutletStatus;
    saldo: Decimal;
    admin_id: string;
}>;
export declare const getPencairanList: () => Promise<({
    outlet: {
        nama_outlet: string;
    };
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.PencairanStatus;
    outlet_id: string;
    jumlah: Decimal;
    nomor_rekening: string;
    nama_pemilik_rekening: string;
    bank_tujuan: string;
    bukti_transfer: string | null;
    catatan_admin: string | null;
    reviewed_at: Date | null;
    reviewed_by: string | null;
})[]>;
export declare const getPencairanById: (id: string) => Promise<{
    superadmin: {
        nama: string;
    } | null;
    outlet: {
        nama_outlet: string;
        admin_id: string;
    };
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.PencairanStatus;
    outlet_id: string;
    jumlah: Decimal;
    nomor_rekening: string;
    nama_pemilik_rekening: string;
    bank_tujuan: string;
    bukti_transfer: string | null;
    catatan_admin: string | null;
    reviewed_at: Date | null;
    reviewed_by: string | null;
}>;
export declare const processPencairan: (pencairanId: string, status: string, buktiTransfer: string | undefined, catatanAdmin: string | undefined, reviewerId: string) => Promise<any>;
export declare const getUsers: () => Promise<{
    role: import(".prisma/client").$Enums.Role;
    id: string;
    nama: string;
    nomor_telepon: string;
    is_active: boolean;
    created_at: Date;
}[]>;
export declare const toggleUser: (userId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
}>;
//# sourceMappingURL=superadmin.service.d.ts.map