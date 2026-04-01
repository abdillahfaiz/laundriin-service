import admin from "../config/firebase";
import prisma from "../config/database";
import { NotifikasiTipe } from "@prisma/client";
import logger from "./logger";

interface NotifData {
  [key: string]: string;
}

/**
 * Send push notification via FCM and save to database
 * FCM failure should NOT fail the main process
 */
export const sendPushNotif = async (
  fcmToken: string | null,
  title: string,
  body: string,
  data: NotifData = {}
): Promise<void> => {
  if (fcmToken) {
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data,
      });
    } catch (err) {
      // [CRITICAL] FCM fail: log error only, do NOT fail main process
      logger.error("FCM push notification failed:", err);
    }
  }
};

/**
 * Save notification to database and optionally send FCM
 */
export const createAndSendNotification = async (
  userId: string,
  orderId: string | null,
  judul: string,
  pesan: string,
  tipe: NotifikasiTipe,
  fcmToken: string | null
): Promise<void> => {
  // Always save to DB
  await prisma.notification.create({
    data: {
      user_id: userId,
      order_id: orderId,
      judul,
      pesan,
      tipe,
    },
  });

  // Send FCM if token exists
  await sendPushNotif(fcmToken, judul, pesan, {
    tipe,
    order_id: orderId || "",
  });
};
