import { io } from "../index.mjs";
import { Notification } from "../models/Notification.mjs";

export const sendNotification = async (userId, content) => {
  const notification = new Notification({ userId, content });
  await notification.save();

  io.to(userId).emit("newNotification", notification);
};

export const getUnreadNotifications = async (params) => {
  if (!params.userId) {
    throw new Error("id not found");
  }
  return await Notification.find({ userId: params.userId, isRead: false });
};

export const markNotificationAsRead = async (params) => {
  if (!params.notificationId) {
    throw new Error("id not found");
  }
  return await Notification.findByIdAndUpdate(params.notificationId, {
    $set: { isRead: true },
  });
};
