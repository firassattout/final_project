import asyncHandler from "express-async-handler";
import {
  getUnreadNotifications,
  markNotificationAsRead,
} from "../Services/notificationService.mjs";

export const getUnreadNotificationsCo = asyncHandler(async (req, res) => {
  const result = await getUnreadNotifications(req.params);
  res.json(result);
});
export const markNotificationAsReadCo = asyncHandler(async (req, res) => {
  const result = await markNotificationAsRead(req.params);
  res.json(result);
});
