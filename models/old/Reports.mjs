
import Joi from "joi";
import mongoose from "mongoose";

const ReportsSchema = new mongoose.Schema({
  reportType: { type: String, required: true },
  filePath: { type: String, required: true },
  createdByUserId:{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users" },
});

export const User = mongoose.model("Reports", ReportsSchema);

export function validateReports(obj) {
  return Joi.object({
    name: Joi.string().required(),

  }).validate(obj);
}

