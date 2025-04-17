import Joi from "joi";
import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
    role: { type: String, required: true, default: "user" },
  },
  { timestamps: true }
);

export const Users = mongoose.model("Users", UsersSchema);

export function validateRegisterUser(obj) {
  return Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
  }).validate(obj);
}

export function validateLoginUser(obj) {
  return Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(obj);
}
