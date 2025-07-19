import express from "express";
import PublisherController from "../controllers/PublisherController.mjs";
import { checkUserRole } from "../middleware/checkUserRole.mjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises"; // Use promises for async
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "../utils/sanitizeInput.mjs";
import logger from "../utils/logger.mjs";
import { generateNonce } from "../utils/securityUtils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publisherRoutes = express.Router();

// Rate limiter for sensitive endpoints
const publisherRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});

// Rate limiter for public endpoints (more lenient)
const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Higher limit for public endpoints
  message: "Too many requests, please try again later.",
});

// Apply rate limiting and sanitization
publisherRoutes.use(publisherRateLimiter, sanitizeInput);

/**
 * @route POST /embed
 * @desc Generate embed code for publisher
 * @access Private (publisher)
 */
publisherRoutes.post(
  "/embed",
  checkUserRole("publisher"),
  PublisherController.embed
);

/**
 * @route GET /show-ad/:userId
 * @desc Show advertisement for publisher
 * @access Public
 */
publisherRoutes.get(
  "/show-ad/:userId",
  publicRateLimiter,
  PublisherController.showAd
);

/**
 * @route POST /track-views
 * @desc Track advertisement views
 * @access Public
 */
publisherRoutes.post(
  "/track-views",
  publicRateLimiter,
  PublisherController.trackViews
);

/**
 * @route POST /track-click
 * @desc Track advertisement clicks
 * @access Public
 */
publisherRoutes.post(
  "/track-click",
  publicRateLimiter,
  PublisherController.trackClick
);

/**
 * @route GET /stream-video
 * @desc Stream video content
 * @access Public
 */
publisherRoutes.get(
  "/stream-video",
  publicRateLimiter,
  PublisherController.streamVideo
);

/**
 * @route GET /:sdkType(rewarded-sdk|vue-rewarded-sdk|banner-sdk)
 * @desc Serve SDK JavaScript file
 * @access Public
 */
publisherRoutes.get(
  "/:sdkType(rewarded-sdk|vue-rewarded-sdk|banner-sdk)",
  publicRateLimiter,
  async (req, res) => {
    const sdkType = req.params.sdkType;
    const filePath = path.join(__dirname, "..", "sdk", `${sdkType}.mjs`);
    const nonce = generateNonce();

    try {
      const data = await fs.readFile(filePath, "utf8");
      const finalScript = data.replace(
        /__URL__/g,
        process.env.URL || "http://localhost:3000"
      );

      res.setHeader("Content-Type", "application/javascript");

      res.setHeader(
        "Content-Security-Policy",
        `script-src 'self' 'nonce-${nonce}'; object-src 'none'; img-src 'self' data:;`
      );

      res.setHeader("X-Content-Type-Options", "nosniff");
      res.send(finalScript);
    } catch (err) {
      logger.error(`Error reading SDK file ${sdkType}: ${err.message}`);
      res.status(500).json({
        status: "error",
        message: "Failed to load SDK file",
      });
    }
  }
);

/**
 * @route POST /report-ad
 * @desc Report an advertisement
 * @access Public
 */
publisherRoutes.post(
  "/report-ad",
  publicRateLimiter,
  PublisherController.reportAd
);
export default publisherRoutes;
