import express from "express";

import { checkUser } from "../middleware/checkUser.mjs";
import multer from "multer";

import {
  createFile,
  differencesFile,
  showFiles,
  updateFile,
  checkIn,
  checkOut,
  showBackups,
  deleteFile,
} from "../controllers/fileController.mjs";
const upload = multer();
export const fileRoutes = express.Router();

fileRoutes.post("/createFile", upload.any(), checkUser, createFile);
fileRoutes.post("/updateFile", upload.any(), checkUser, updateFile);
fileRoutes.post("/differencesFile", checkUser, differencesFile);
fileRoutes.get("/showFiles/:groupId", checkUser, showFiles);
fileRoutes.post("/checkIn", checkUser, checkIn);
fileRoutes.post("/checkOut", checkUser, checkOut);
fileRoutes.post("/showBackups", checkUser, showBackups);
fileRoutes.get("/deleteFile/:fileId", checkUser, deleteFile);
