import asyncHandler from "express-async-handler";
import AuthFacade from "../facade/AuthFacade.mjs";

class AuthController {
  userFirstRegister = asyncHandler(async (req, res) => {
    const result = await AuthFacade.handleFirstRegister(req.body);
    res.json(result);
  });
  userSecondRegister = asyncHandler(async (req, res) => {
    const result = await AuthFacade.handleSecondRegister(req);
    res.json(result);
  });

  userLogin = asyncHandler(async (req, res) => {
    const result = await AuthFacade.handleLogin(req);
    res.json(result);
  });
  userDeactivation = asyncHandler(async (req, res) => {
    const result = await AuthFacade.handleDeactivation(req);
    res.json(result);
  });
  getUser = asyncHandler(async (req, res) => {
    const result = await AuthFacade.getUser(req);
    res.json(result);
  });

  userLogout = asyncHandler(async (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const access_token = await AuthFacade.handleRefreshToken(refreshToken);
    res.json({ access_token });
  });
}

export default new AuthController();
