import express from "express";
import AnalyticController from "../controllers/AnalyticController.mjs";
import { checkUserRole } from "../middleware/checkUserRole.mjs";
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "../utils/sanitizeInput.mjs";

const analyticsRoutes = express.Router();

// Rate limiter for analytics endpoints
const analyticsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});

// Apply rate limiting and sanitization
analyticsRoutes.use(analyticsRateLimiter, sanitizeInput);

/**
 * @route GET /publisher-analytics
 * @desc Get analytics for publisher
 * @access Private (publisher)
 */
analyticsRoutes.post(
  "/publisher-analytics",
  checkUserRole("publisher"),
  AnalyticController.publisherAnalytics
);

/**
 * @route GET /advertiser-analytics
 * @desc Get analytics for advertiser
 * @access Private (advertiser)
 */
analyticsRoutes.post(
  "/advertiser-analytics",
  checkUserRole("advertiser"),
  AnalyticController.advertiserAnalytics
);

/**
 * @route GET /admin-analytics
 * @desc Get analytics for admin
 * @access Private (admin)
 */
analyticsRoutes.get(
  "/admin-analytics",
  checkUserRole("admin"),
  AnalyticController.adminAnalytics
);

export default analyticsRoutes;
