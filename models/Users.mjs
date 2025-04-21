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
    companyName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    nationalId: {
      type: String,
      required: true,
      unique: true,
    },
    twoFactorAuth: { type: Boolean, default: false },
    lastLogin: { type: Date },
    loginHistory: [
      {
        ip: String,
        device: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

export const Users = mongoose.model("Users", UsersSchema);
