import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    adId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ads",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    reportedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", ReportSchema);
