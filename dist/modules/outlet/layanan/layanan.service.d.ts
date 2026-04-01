export declare const getJenisLayanan: (outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    deskripsi: string | null;
}[]>;
export declare const createJenisLayanan: (outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    deskripsi: string | null;
}>;
export declare const updateJenisLayanan: (id: string, outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    deskripsi: string | null;
}>;
export declare const deleteJenisLayanan: (id: string, outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    deskripsi: string | null;
}>;
export declare const getDurasiLayanan: (outletId: string, jenisLayananId?: string) => Promise<({
    jenis_layanan: {
        nama: string;
    };
} & {
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    jenis_layanan_id: string;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
})[]>;
export declare const createDurasiLayanan: (outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    jenis_layanan_id: string;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
}>;
export declare const updateDurasiLayanan: (id: string, outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    jenis_layanan_id: string;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
}>;
export declare const deleteDurasiLayanan: (id: string, outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    jenis_layanan_id: string;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
}>;
export declare const getItemLayanan: (outletId: string) => Promise<{
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    nama_item: string;
    foto_item: string | null;
}[]>;
export declare const createItemLayanan: (outletId: string, data: any) => Promise<{
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    nama_item: string;
    foto_item: string | null;
}>;
export declare const updateItemLayanan: (id: string, outletId: string, data: any) => Promise<{
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    nama_item: string;
    foto_item: string | null;
}>;
export declare const deleteItemLayanan: (id: string, outletId: string) => Promise<{
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    nama_item: string;
    foto_item: string | null;
}>;
export declare const getParfum: (outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    harga: import("@prisma/client/runtime/library").Decimal;
}[]>;
export declare const createParfum: (outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    harga: import("@prisma/client/runtime/library").Decimal;
}>;
export declare const updateParfum: (id: string, outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    harga: import("@prisma/client/runtime/library").Decimal;
}>;
export declare const deleteParfum: (id: string, outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    outlet_id: string;
    harga: import("@prisma/client/runtime/library").Decimal;
}>;
export declare const getJenisPerItem: (itemId: string, outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deskripsi: string | null;
    item_layanan_id: string;
}[]>;
export declare const createJenisPerItem: (itemId: string, outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deskripsi: string | null;
    item_layanan_id: string;
}>;
export declare const updateJenisPerItem: (id: string, outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deskripsi: string | null;
    item_layanan_id: string;
}>;
export declare const toggleJenisPerItem: (id: string, outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deskripsi: string | null;
    item_layanan_id: string;
}>;
export declare const deleteJenisPerItem: (id: string, outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deskripsi: string | null;
    item_layanan_id: string;
}>;
export declare const getDurasiPerItem: (jenisId: string, outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
    jenis_per_item_id: string;
}[]>;
export declare const createDurasiPerItem: (jenisId: string, outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
    jenis_per_item_id: string;
}>;
export declare const updateDurasiPerItem: (id: string, outletId: string, data: any) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
    jenis_per_item_id: string;
}>;
export declare const toggleDurasiPerItem: (id: string, outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
    jenis_per_item_id: string;
}>;
export declare const deleteDurasiPerItem: (id: string, outletId: string) => Promise<{
    id: string;
    nama: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    estimasi_jam: number;
    harga: import("@prisma/client/runtime/library").Decimal;
    jenis_per_item_id: string;
}>;
//# sourceMappingURL=layanan.service.d.ts.map