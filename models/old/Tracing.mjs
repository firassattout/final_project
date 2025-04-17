import mongoose from "mongoose";

const tracingSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    details: { type: Object, required: true },

    fileId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Files",
    },
  },
  { timestamps: true }
);

export const Tracing = mongoose.model("Tracing", tracingSchema);
