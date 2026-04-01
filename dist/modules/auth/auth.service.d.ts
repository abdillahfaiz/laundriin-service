interface RegisterCustomerInput {
    nama: string;
    nomor_telepon: string;
    password: string;
}
interface RegisterOutletInput {
    nama_outlet: string;
    alamat: string;
    foto_outlet?: string;
    lat: number;
    lng: number;
    nama_pemilik: string;
    nomor_telepon: string;
    password: string;
}
interface LoginInput {
    nomor_telepon: string;
    password: string;
}
export declare const registerCustomer: (input: RegisterCustomerInput) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        role: import(".prisma/client").$Enums.Role;
        id: string;
        nama: string;
        nomor_telepon: string;
        created_at: Date;
    };
}>;
export declare const registerOutlet: (input: RegisterOutletInput) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        nama: string;
        nomor_telepon: string;
        role: import(".prisma/client").$Enums.Role;
    };
    outlet: {
        id: string;
        nama_outlet: string;
        status: import(".prisma/client").$Enums.OutletStatus;
    };
}>;
export declare const login: (input: LoginInput) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        nama: string;
        nomor_telepon: string;
        role: import(".prisma/client").$Enums.Role;
        outletId: string | null;
    };
}>;
export declare const refreshToken: (token: string) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare const updateFcmToken: (userId: string, fcmToken: string) => Promise<void>;
export {};
//# sourceMappingURL=auth.service.d.ts.map