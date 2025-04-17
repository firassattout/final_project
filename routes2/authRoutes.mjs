import express from "express";

import {
  userLogin,
  userLogout,
  userRegister,
} from "../controllers/authController.mjs";
import { Users } from "../models/Users.mjs";

import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/tokenUtils.js";

export const auth = express.Router();

auth.post("/register", userRegister);

auth.post("/login", userLogin);

auth.post("/logout", userLogout);

auth.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.SECRET);
    const user = await Users.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const access_token = generateAccessToken(user);
    res.json({ access_token });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});
