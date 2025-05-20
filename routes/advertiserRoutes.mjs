import express from "express";
import AdvertiserController from "../controllers/AdvertiserController.mjs";

import { checkUserRole } from "../middleware/checkUserRole.mjs";
import multer from "multer";
const upload = multer();
export const advertiserRoutes = express.Router();

advertiserRoutes.post(
  "/create-ad",
  checkUserRole("advertiser"),
  AdvertiserController.createAd
);
advertiserRoutes.post(
  "/edit-ad",
  checkUserRole("advertiser"),
  AdvertiserController.editAd
);
advertiserRoutes.post(
  "/add-media",
  upload.any(),
  checkUserRole("advertiser"),
  AdvertiserController.addMedia
);
advertiserRoutes.post(
  "/value-check",
  checkUserRole("advertiser"),
  AdvertiserController.valueCheck
);
advertiserRoutes.get(
  "/get-ad",
  checkUserRole("advertiser"),
  AdvertiserController.getAd
);
advertiserRoutes.get(
  "/get-media/:adId",
  checkUserRole("advertiser"),
  AdvertiserController.getMedia
);
