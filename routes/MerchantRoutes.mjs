import express from "express";

import { checkUserRole } from "../middleware/checkUserRole.mjs";
import MerchantController from "../controllers/MerchantController.mjs";

const merchantRoutes = express.Router();

/**
 * @route POST /merchant-app
 * @desc Create a new merchant application
 * @access Private (user only)
 */
merchantRoutes.post(
  "/merchant-app",
  checkUserRole("merchant"),
  MerchantController.createMerchantApp
);
/**
 * @route Get /merchant-app
 * @desc get merchant application
 * @access Private (user only)
 */
merchantRoutes.get(
  "/merchant-app",
  checkUserRole("merchant"),
  MerchantController.getMerchantApp
);

export default merchantRoutes;
