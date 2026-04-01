import prisma from "../../../config/database";

export const getNotifications = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  return notifications;
};

export const markAsRead = async (notificationId: string, userId: string) => {
  await prisma.notification.updateMany({
    where: { id: notificationId, user_id: userId },
    data: { is_read: true },
  });
};

export const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  });
};
