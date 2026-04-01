export declare const getKasirList: (outletId: string) => Promise<({
    user: {
        id: string;
        nama: string;
        nomor_telepon: string;
        is_active: boolean;
        created_at: Date;
    };
} & {
    id: string;
    is_active: boolean;
    created_at: Date;
    outlet_id: string;
    user_id: string;
})[]>;
export declare const createKasir: (outletId: string, data: any) => Promise<{
    user: {
        id: string;
        nama: string;
        nomor_telepon: string;
    };
} & {
    id: string;
    is_active: boolean;
    created_at: Date;
    outlet_id: string;
    user_id: string;
}>;
export declare const updateKasir: (kasirId: string, outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    nomor_telepon: string;
}>;
export declare const toggleKasir: (kasirId: string, outletId: string) => Promise<{
    user: {
        id: string;
        nama: string;
        is_active: boolean;
    };
} & {
    id: string;
    is_active: boolean;
    created_at: Date;
    outlet_id: string;
    user_id: string;
}>;
//# sourceMappingURL=kasir.service.d.ts.map