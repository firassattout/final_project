import Joi from "joi";
import mongoose from "mongoose";

const GroupsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    photo: { type: String },
    state: { type: String },
    filesFolder: { type: String },
  },
  { timestamps: true }
);

export const Groups = mongoose.model("Groups", GroupsSchema);

export function validateGroups(obj) {
  return Joi.object({
    name: Joi.string().required().messages({
      "any.required": "اسم المجموعة مطلوب",
    }),
    photo: Joi.string().optional(),
    state: Joi.string().optional(),
  })
    .options({ allowUnknown: true })
    .validate(obj);
}
