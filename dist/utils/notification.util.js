"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSendNotification = exports.sendPushNotif = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("./logger"));
/**
 * Send push notification via FCM and save to database
 * FCM failure should NOT fail the main process
 */
const sendPushNotif = async (fcmToken, title, body, data = {}) => {
    if (fcmToken) {
        try {
            await firebase_1.default.messaging().send({
                token: fcmToken,
                notification: { title, body },
                data,
            });
        }
        catch (err) {
            // [CRITICAL] FCM fail: log error only, do NOT fail main process
            logger_1.default.error("FCM push notification failed:", err);
        }
    }
};
exports.sendPushNotif = sendPushNotif;
/**
 * Save notification to database and optionally send FCM
 */
const createAndSendNotification = async (userId, orderId, judul, pesan, tipe, fcmToken) => {
    // Always save to DB
    await database_1.default.notification.create({
        data: {
            user_id: userId,
            order_id: orderId,
            judul,
            pesan,
            tipe,
        },
    });
    // Send FCM if token exists
    await (0, exports.sendPushNotif)(fcmToken, judul, pesan, {
        tipe,
        order_id: orderId || "",
    });
};
exports.createAndSendNotification = createAndSendNotification;
//# sourceMappingURL=notification.util.js.map