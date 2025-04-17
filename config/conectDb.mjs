import mongoose from "mongoose";

export default async function connectDb() {
  try {
    await mongoose.connect(process.env.mongodbUrl);
    console.log("db is connected");
  } catch (error) {
    console.log("db is not connected", error);
  }
}
