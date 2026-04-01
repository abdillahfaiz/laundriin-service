import { Prisma } from "@prisma/client";
export declare const getSaldo: (outletId: string) => Promise<{
    saldo: Prisma.Decimal;
}>;
export declare const getSaldoLog: (outletId: string) => Promise<{
    id: string;
    created_at: Date;
    outlet_id: string;
    tipe: import(".prisma/client").$Enums.SaldoTipe;
    jumlah: Prisma.Decimal;
    saldo_sebelum: Prisma.Decimal;
    saldo_sesudah: Prisma.Decimal;
    referensi_id: string | null;
    keterangan: string | null;
}[]>;
export declare const requestPencairan: (outletId: string, data: any) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.PencairanStatus;
    outlet_id: string;
    jumlah: Prisma.Decimal;
    nomor_rekening: string;
    nama_pemilik_rekening: string;
    bank_tujuan: string;
    bukti_transfer: string | null;
    catatan_admin: string | null;
    reviewed_at: Date | null;
    reviewed_by: string | null;
}>;
export declare const getPencairanList: (outletId: string) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.PencairanStatus;
    outlet_id: string;
    jumlah: Prisma.Decimal;
    nomor_rekening: string;
    nama_pemilik_rekening: string;
    bank_tujuan: string;
    bukti_transfer: string | null;
    catatan_admin: string | null;
    reviewed_at: Date | null;
    reviewed_by: string | null;
}[]>;
export declare const getPencairanById: (pencairanId: string, outletId: string) => Promise<{
    superadmin: {
        nama: string;
    } | null;
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: import(".prisma/client").$Enums.PencairanStatus;
    outlet_id: string;
    jumlah: Prisma.Decimal;
    nomor_rekening: string;
    nama_pemilik_rekening: string;
    bank_tujuan: string;
    bukti_transfer: string | null;
    catatan_admin: string | null;
    reviewed_at: Date | null;
    reviewed_by: string | null;
}>;
//# sourceMappingURL=saldo.service.d.ts.map