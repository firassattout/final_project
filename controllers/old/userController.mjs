import asyncHandler from "express-async-handler";

import userService from "../Services/userService.mjs";

export const userSearch = asyncHandler(async (req, res) => {
  const result = await userService.search(req.body);
  res.json(result);
});
export const fileRequireAcceptForAdmin = asyncHandler(async (req, res) => {
  const result = await userService.fileRequireAcceptForAdmin(req);
  res.json(result);
});
export const fileRequireAcceptForUser = asyncHandler(async (req, res) => {
  const result = await userService.fileRequireAcceptForUser(req);
  res.json(result);
});
export const acceptFile = asyncHandler(async (req, res) => {
  const result = await userService.acceptFile(req);
  res.json(result);
});
export const rejectFile = asyncHandler(async (req, res) => {
  const result = await userService.rejectFile(req);
  res.json(result);
});
