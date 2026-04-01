export declare const getNotifications: (userId: string) => Promise<{
    id: string;
    created_at: Date;
    user_id: string;
    order_id: string | null;
    judul: string;
    pesan: string;
    tipe: import(".prisma/client").$Enums.NotifikasiTipe;
    is_read: boolean;
}[]>;
export declare const markAsRead: (notificationId: string, userId: string) => Promise<void>;
export declare const markAllAsRead: (userId: string) => Promise<void>;
//# sourceMappingURL=notification.service.d.ts.map