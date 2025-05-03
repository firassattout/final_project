import mongoose from "mongoose";

const CompanyTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    priceRating: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Price rating must be an integer between 1 and 5",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const CompanyType = mongoose.model("CompanyType", CompanyTypeSchema);
