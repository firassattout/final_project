import express from "express";

import { checkUserRole } from "../middleware/checkUserRole.mjs";
import PaymentController from "../controllers/PaymentController.mjs";

const paymentRoutes = express.Router();

/**
 * @route POST /merchant-app
 * @desc Create a new merchant application
 * @access Private (user only)
 */
paymentRoutes.post(
  "/merchant-app",
  checkUserRole("merchant"),
  PaymentController.createMerchantApp
);
/**
 * @route Get /merchant-app
 * @desc get merchant application
 * @access Private (user only)
 */
paymentRoutes.get(
  "/merchant-app",
  checkUserRole("merchant"),
  PaymentController.getMerchantApp
);
/**
 * @route delete /merchant-app
 * @desc delete merchant app
 * @access Private (user only)
 */
paymentRoutes.delete(
  "/merchant-app/:appId",
  checkUserRole("merchant"),
  PaymentController.deleteMerchantApp
);
/**
 * @route Get /transaction
 * @desc get merchant application
 * @access Private (user only)
 */
paymentRoutes.post(
  "/get-transaction-by-program",
  checkUserRole("merchant"),
  PaymentController.getTransactionByProgram
);
/**
 * @route Get /transaction
 * @desc get merchant application
 * @access Private (user only)
 */
paymentRoutes.post(
  "/get-transaction",
  checkUserRole("merchant"),
  PaymentController.getTransaction
);
export default paymentRoutes;
