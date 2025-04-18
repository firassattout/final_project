import mongoose from "mongoose";

const RevenuesSchema = new mongoose.Schema(
  {
    adId: { type: mongoose.Schema.Types.ObjectId, ref: "Ads", required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    revenueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Revenues = mongoose.model("Revenues", RevenuesSchema);
