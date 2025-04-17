import Joi from "joi";
import mongoose from "mongoose";

const BackupsSchema = new mongoose.Schema(
  {
    filePath: { type: String, required: true },
    fileDifferencePath: { type: String },
    commit: { type: String },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Files",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
  },
  { timestamps: true }
);

export const Backups = mongoose.model("Backups", BackupsSchema);

export function validateBackups(obj) {
  return Joi.object({
    fileId: Joi.string().required(),
  })
    .options({ allowUnknown: true })
    .validate(obj);
}
