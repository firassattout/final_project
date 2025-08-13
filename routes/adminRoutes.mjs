import express from "express";
import adminController from "../controllers/adminController.mjs";
import { checkUserRole } from "../middleware/checkUserRole.mjs";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "../utils/sanitizeInput.mjs";

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
const adminRouter = express.Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: "Too many requests, please try again later.",
});

adminRouter.use(authRateLimiter, sanitizeInput);

/**
 * @route POST /user-deactivation/:id
 * @desc Deactivate user (admin only)
 * @access Private (admin)
 */
adminRouter.post(
  "/user-deactivation/:id",
  checkUserRole("admin"),
  adminController.userDeactivation
);

/**
 * @route GET /get-user/:type?/:name?
 * @desc Get users by type or name (admin only)
 * @access Private (admin)
 */
adminRouter.get(
  "/get-user/:type?/:name?",
  checkUserRole("admin"),
  adminController.getUser
);

/**
 * @route GET /get-companyType
 * @desc Get company types (admin only)
 * @access Private (admin)
 */
adminRouter.get(
  "/get-companyType",
  checkUserRole("admin"),
  adminController.getCompanyType
);

/**
 * @route post /get-ad-admin
 * @desc get advertisements for user
 * @access Private (admin)
 */
adminRouter.post(
  "/get-ad-admin",
  checkUserRole("admin"),
  adminController.getAd
);
/**
 * @route post /get-one-user
 * @desc get one user for admin
 * @access Private (admin)
 */
adminRouter.post(
  "/get-one-user",
  checkUserRole("admin"),
  adminController.getOneUser
);

/**
 * @route Post /paused-ad
 * @desc changeStateAd for an admin
 * @access Private (admin)
 */
adminRouter.post(
  "/change-state-ad-admin",
  checkUserRole("admin"),
  adminController.changeStateAd
);

/**
 * @route GET /reports
 * @desc Get reports with pagination and filtering
 * @access Private (admin only)
 */
adminRouter.get("/reports", checkUserRole("admin"), adminController.getReports);

/**
 * @route GET /reports/pending-count
 * @desc Get count of pending reports
 * @access Private (admin only)
 */
adminRouter.get(
  "/reports/pending-count",
  checkUserRole("admin"),
  adminController.countPendingReports
);

export default adminRouter;
