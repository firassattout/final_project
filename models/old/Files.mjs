import Joi from "joi";
import mongoose from "mongoose";

const FilesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, required: true },
    filesFolder: { type: String },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Groups",
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    acceptedByAdmin: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const Files = mongoose.model("Files", FilesSchema);

export function validateFiles(obj) {
  return Joi.object({
    groupId: Joi.string().required(),
  })
    .options({ allowUnknown: true })
    .validate(obj);
}
