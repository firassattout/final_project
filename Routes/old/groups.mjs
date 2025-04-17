import express from "express";
import {
  addUser,
  createGroups,
  showGroups,
  showUsers,
} from "../controllers/groupsController.mjs";
import { checkUser } from "../middleware/checkUser.mjs";
import multer from "multer";
const upload = multer();
export const groups = express.Router();

groups.post("/createGroup", upload.any(), checkUser, createGroups);
groups.get("/showGroups", checkUser, showGroups);
groups.post("/showUsers", checkUser, showUsers);
groups.post("/addUser", checkUser, addUser);
