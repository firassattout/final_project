import express from "express";
import AdvertiserController from "../controllers/AdvertiserController.mjs";
import { checkUserRole } from "../middleware/checkUserRole.mjs";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "../utils/sanitizeInput.mjs";

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and MP4 are allowed."));
    }
  },
});

const advertiserRoutes = express.Router();

// Rate limiter for sensitive endpoints
const adRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: "Too many requests, please try again later.",
});

// Apply rate limiting and sanitization
advertiserRoutes.use(adRateLimiter, sanitizeInput);

/**
 * @route POST /create-ad
 * @desc Create a new advertisement
 * @access Private (advertiser)
 */
advertiserRoutes.post(
  "/create-ad",
  checkUserRole("advertiser"),
  AdvertiserController.createAd
);

/**
 * @route POST /edit-ad
 * @desc Edit an existing advertisement
 * @access Private (advertiser)
 */
advertiserRoutes.post(
  "/edit-ad",
  checkUserRole("advertiser"),
  AdvertiserController.editAd
);

/**
 * @route POST /add-media
 * @desc Add media to an advertisement
 * @access Private (advertiser)
 */
advertiserRoutes.post(
  "/add-media",
  upload.single("media"), // Changed to single file upload
  checkUserRole("advertiser"),
  AdvertiserController.addMedia
);

/**
 * @route POST /value-check
 * @desc Check advertisement value
 * @access Private (advertiser)
 */
advertiserRoutes.post(
  "/value-check",
  checkUserRole("advertiser"),
  AdvertiserController.valueCheck
);

/**
 * @route GET /get-ad
 * @desc Get advertisements for user
 * @access Private (advertiser)
 */
advertiserRoutes.post(
  "/get-ad",
  checkUserRole("advertiser"),
  AdvertiserController.getAd
);

/**
 * @route GET /get-media/:adId
 * @desc Get media for an advertisement
 * @access Private (advertiser)
 */
advertiserRoutes.post(
  "/get-media",
  checkUserRole("advertiser"),
  AdvertiserController.getMedia
);

export default advertiserRoutes;
