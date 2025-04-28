import express from "express";
import authController from "../controllers/authController.mjs";
import { checkUserRole } from "../middleware/checkUserRole.mjs";
import multer from "multer";
const upload = multer();
export const auth = express.Router();

auth.post("/first-register", authController.userFirstRegister);
auth.post(
  "/second-register",
  upload.any(),
  checkUserRole(null),
  authController.userSecondRegister
);
auth.post("/login", authController.userLogin);
auth.post(
  "/user-deactivation/:id",
  checkUserRole("admin"),
  authController.userDeactivation
);
auth.get(
  "/get-user/:type?/:name?",
  checkUserRole("admin"),
  authController.getUser
);
auth.post("/logout", authController.userLogout);
auth.post("/refresh-token", authController.refreshToken);
