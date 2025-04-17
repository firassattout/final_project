import express from "express";
import {
  acceptFile,
  fileRequireAcceptForAdmin,
  fileRequireAcceptForUser,
  rejectFile,
  userSearch,
} from "../controllers/userController.mjs";
import { getTraces, TracesGroup } from "../Services/tracingService.mjs";
import { checkUser } from "../middleware/checkUser.mjs";
import {
  getUnreadNotificationsCo,
  markNotificationAsReadCo,
} from "../controllers/notificationController.mjs";

export const user = express.Router();

user.post("/userSearch", checkUser, userSearch);
user.get(
  "/fileRequireAcceptForAdmin/:groupId",
  checkUser,
  fileRequireAcceptForAdmin
);
user.get(
  "/fileRequireAcceptForUser/:groupId",
  checkUser,
  fileRequireAcceptForUser
);
user.get("/acceptFile/:fileId", checkUser, acceptFile);
user.get("/rejectFile/:fileId", checkUser, rejectFile);

user.get(
  "/getUnreadNotifications/:userId",
  checkUser,
  getUnreadNotificationsCo
);
user.get(
  "/markNotificationAsRead/:notificationId",
  checkUser,
  markNotificationAsReadCo
);
