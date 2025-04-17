import mongoose from "mongoose";
import { deleteFile2 } from "../config/deleteFiles.mjs";

export const startTransaction = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  return session;
};

export const endTransaction = async (error, context) => {
  if (error) {
    await context.session.abortTransaction();
  } else {
    await context.session.commitTransaction();
  }
};

export const endTransactionWithFile = async (error, context) => {
  if (error) {
    await context.session.abortTransaction();
    if (context.folder) await deleteFile2(context.folder);
  } else {
    await context.session.commitTransaction();
  }
};
