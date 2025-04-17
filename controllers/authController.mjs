import asyncHandler from "express-async-handler";
import {
  login,
  refreshAccessToken,
  register,
} from "../services/authService.mjs";

export const userRegister = asyncHandler(async (req, res) => {
  const result = await register(req.body);
  res.json(result);
});

export const userLogin = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  res.json(result);
});

export const userLogout = asyncHandler(async (req, res) => {
  res.json({ message: "Logged out successfully" });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const access_token = await refreshAccessToken(refreshToken);
  res.json({ access_token });
});
