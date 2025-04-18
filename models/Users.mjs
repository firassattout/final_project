import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
    photo: { type: String },
    role: {
      type: String,
      enum: ["admin", "advertiser", "partner"],
      required: true,
      default: "advertiser",
    },

    state: {
      type: String,
      enum: ["active", "pending"],
      required: true,
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Users = mongoose.model("Users", UsersSchema);
