import express from "express";
import authController from "../controllers/authController.mjs";
import { checkUserRole } from "../middleware/checkUserRole.mjs";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "../utils/sanitizeInput.mjs";

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
const authRouter = express.Router();

// Rate limiter for sensitive endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});

// Apply rate limiting and sanitization to all routes
authRouter.use(authRateLimiter, sanitizeInput);

/**
 * @route POST /first-register
 * @desc Register initial user (admin only)
 * @access Private (admin)
 */
authRouter.post(
  "/first-register",
  checkUserRole("admin"),
  authController.userFirstRegister
);

/**
 * @route POST /second-register
 * @desc Complete user registration
 * @access Private
 */
authRouter.post(
  "/second-register",
  upload.any(),
  checkUserRole(null),
  authController.userSecondRegister
);

/**
 * @route POST /login
 * @desc User login
 * @access Public
 */
authRouter.post("/login", authController.userLogin);

/**
 * @route POST /logout
 * @desc User logout
 * @access Private
 */
authRouter.post("/logout", authController.userLogout);

/**
 * @route POST /refresh-token
 * @desc Refresh access token
 * @access Public
 */
authRouter.post("/refresh-token", authController.refreshToken);

export default authRouter;
