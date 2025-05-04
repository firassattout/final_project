import express from "express";
import AdController from "../controllers/AdController.mjs";

import { checkUserRole } from "../middleware/checkUserRole.mjs";

export const adRoutes = express.Router();

adRoutes.post("/create-ad", checkUserRole("advertiser"), AdController.createAd);
adRoutes.post("/edit-ad", checkUserRole("advertiser"), AdController.editAd);
adRoutes.post(
  "/value-check",
  checkUserRole("advertiser"),
  AdController.valueCheck
);
