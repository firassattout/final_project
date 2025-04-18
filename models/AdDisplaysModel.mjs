import mongoose from "mongoose";

const AdDisplaysSchema = new mongoose.Schema(
  {
    adId: { type: mongoose.Schema.Types.ObjectId, ref: "Ads", required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    displayDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const AdDisplays = mongoose.model("AdDisplays", AdDisplaysSchema);
