"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const database_1 = __importDefault(require("../../../config/database"));
const getNotifications = async (userId) => {
    const notifications = await database_1.default.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        take: 50,
    });
    return notifications;
};
exports.getNotifications = getNotifications;
const markAsRead = async (notificationId, userId) => {
    await database_1.default.notification.updateMany({
        where: { id: notificationId, user_id: userId },
        data: { is_read: true },
    });
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (userId) => {
    await database_1.default.notification.updateMany({
        where: { user_id: userId, is_read: false },
        data: { is_read: true },
    });
};
exports.markAllAsRead = markAllAsRead;
//# sourceMappingURL=notification.service.js.map