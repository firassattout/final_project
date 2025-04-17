import asyncHandler from "express-async-handler";
import groupsService from "../Services/groupsService.mjs";
import { checkUser } from "../middleware/checkUser.mjs";

export const createGroups = asyncHandler(async (req, res) => {
  const result = await groupsService.create(req);
  res.json(result);
});
export const showGroups = asyncHandler(async (req, res) => {
  const result = await groupsService.show(req);
  res.json(result);
});
export const showUsers = asyncHandler(async (req, res) => {
  const result = await groupsService.showUsers(req.body);
  res.json(result);
});
export const addUser = asyncHandler(async (req, res) => {
  const result = await groupsService.addUser(req.body);
  res.json(result);
});
