import asyncHandler from "express-async-handler";
import AuthFacade from "../facade/AuthFacade.mjs";

class AuthController {
  constructor() {
    this.authFacade = new AuthFacade();
  }

  userFirstRegister = asyncHandler(async (req, res) => {
    const result = await this.authFacade.handleFirstRegister(req.body);
    res.json(result);
  });
  userSecondRegister = asyncHandler(async (req, res) => {
    const result = await this.authFacade.handleSecondRegister(req);
    res.json(result);
  });

  userLogin = asyncHandler(async (req, res) => {
    const result = await this.authFacade.handleLogin(req.body);
    res.json(result);
  });

  userLogout = asyncHandler(async (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const access_token = await this.authFacade.handleRefreshToken(refreshToken);
    res.json({ access_token });
  });
}

export default new AuthController();
