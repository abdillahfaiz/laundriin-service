import { NotifikasiTipe } from "@prisma/client";
interface NotifData {
    [key: string]: string;
}
/**
 * Send push notification via FCM and save to database
 * FCM failure should NOT fail the main process
 */
export declare const sendPushNotif: (fcmToken: string | null, title: string, body: string, data?: NotifData) => Promise<void>;
/**
 * Save notification to database and optionally send FCM
 */
export declare const createAndSendNotification: (userId: string, orderId: string | null, judul: string, pesan: string, tipe: NotifikasiTipe, fcmToken: string | null) => Promise<void>;
export {};
//# sourceMappingURL=notification.util.d.ts.map