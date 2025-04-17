import Joi from "joi";
import mongoose from "mongoose";

const GroupUserSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Groups",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

export const GroupUser = mongoose.model("GroupUser", GroupUserSchema);

export function validateGroupUser(obj) {
  return Joi.object({
    groupId: Joi.required(),
    userId: Joi.required(),
  }).validate(obj);
}
