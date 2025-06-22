import asyncHandler from "express-async-handler";
import AuthFacade from "../facade/AuthFacade.mjs";
import logger from "../utils/logger.mjs";

class AuthController {
  /**
   * Handle first user registration
   */
  userFirstRegister = asyncHandler(async (req, res) => {
    const result = await AuthFacade.handleFirstRegister(req.body);
    res.status(201).json(result);
  });

  /**
   * Handle second user registration
   */
  userSecondRegister = asyncHandler(async (req, res) => {
    const result = await AuthFacade.handleSecondRegister(req);
    res.status(200).json(result);
  });

  /**
   * Handle user login
   */
  userLogin = asyncHandler(async (req, res) => {
    const result = await AuthFacade.handleLogin(req);
    res.status(200).json(result);
  });

  /**
   * Handle user deactivation
   */
  userDeactivation = asyncHandler(async (req, res) => {
    const result = await AuthFacade.handleDeactivation(req.params);
    res.status(200).json(result);
  });

  /**
   * Get users
   */
  getUser = asyncHandler(async (req, res) => {
    const result = await AuthFacade.getUser(req.params);
    res.status(200).json(result);
  });

  /**
   * Get company types
   */
  getCompanyType = asyncHandler(async (req, res) => {
    const result = await AuthFacade.getCompanyType();
    res.status(200).json(result);
  });

  /**
   * Handle user logout
   */
  userLogout = asyncHandler(async (req, res) => {
    // Invalidate refresh token in real implementation
    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  });

  /**
   * Handle token refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthFacade.handleRefreshToken(refreshToken);
    res.status(200).json(result);
  });
}

export default new AuthController();
