import mongoose from "mongoose";

const AdsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    budget: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    platform: {
      type: String,
      enum: ["web", "mobile", "both"],
      required: true,
    },
    type: {
      type: String,
      enum: ["banner", "rewarded", "app_open"],
      required: true,
    },
    pricingModel: {
      type: String,
      enum: ["CPC", "CPM"],
      required: true,
      default: "CPC",
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      enum: ["pending", "active", "paused", "ended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Ads = mongoose.model("Ads", AdsSchema);
