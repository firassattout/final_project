import express from "express";
import AdController from "../controllers/AdController.mjs";

import { checkUserRole } from "../middleware/checkUserRole.mjs";
import multer from "multer";
const upload = multer();
export const adRoutes = express.Router();

adRoutes.post("/create-ad", checkUserRole("advertiser"), AdController.createAd);
adRoutes.post("/edit-ad", checkUserRole("advertiser"), AdController.editAd);
adRoutes.post(
  "/add-media",
  upload.any(),
  checkUserRole("advertiser"),
  AdController.addMedia
);
adRoutes.post(
  "/value-check",
  checkUserRole("advertiser"),
  AdController.valueCheck
);
adRoutes.get("/get-ad", checkUserRole("advertiser"), AdController.getAd);
