import express from "express";
import AnalyticController from "../controllers/AnalyticController.mjs";

import { checkUserRole } from "../middleware/checkUserRole.mjs";

export const analyticsRoutes = express.Router();

analyticsRoutes.get(
  "/publisher-analytics",
  checkUserRole("publisher"),
  AnalyticController.publisherAnalytics
);
analyticsRoutes.get(
  "/advertiser-analytics",
  checkUserRole("advertiser"),
  AnalyticController.advertiserAnalytics
);
analyticsRoutes.get(
  "/admin-analytics",
  checkUserRole("admin"),
  AnalyticController.adminAnalytics
);
