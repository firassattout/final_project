import mongoose from "mongoose";

const AdMediaSchema = new mongoose.Schema(
  {
    adId: { type: mongoose.Schema.Types.ObjectId, ref: "Ads", required: true },
    url: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], required: true },
  },
  { timestamps: true }
);

export const AdMedia = mongoose.model("AdMedia", AdMediaSchema);
