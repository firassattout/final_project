import mongoose from "mongoose";

const EarningsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  date: { type: Date, required: true },
  earnings: { type: Number, required: true, default: 0 },
});
export const Earnings = mongoose.model("Earnings", EarningsSchema);
