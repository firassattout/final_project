import express from "express";
import adminController from "../controllers/adminController.mjs";
import { checkUserRole } from "../middleware/checkUserRole.mjs";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "../utils/sanitizeInput.mjs";

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
const adminRouter = express.Router();

// Rate limiter for sensitive endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});

// Apply rate limiting and sanitization to all routes
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
 * @route GET /get-ad-admin
 * @desc Get advertisements for user
 * @access Private (advertiser)
 */
adminRouter.post(
  "/get-ad-admin",
  checkUserRole("admin"),
  adminController.getAd
);
export default adminRouter;
