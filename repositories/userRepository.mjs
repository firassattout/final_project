import { Users } from "../models/Users.mjs";

export const findUserByEmail = async (email) => {
  return await Users.findOne({ email });
};

export const createUser = async (userData) => {
  const user = new Users(userData);
  return await user.save();
};

export const updateUser = async (userId, data) => {
  return await Users.findByIdAndUpdate(userId, data);
};
export const updateUserRefreshToken = async (userId, refreshToken) => {
  return await Users.findByIdAndUpdate(userId, { refreshToken }, { new: true });
};

export const findUserById = async (id) => {
  return await Users.findById(id);
};

export const updateLoginData = async (userId, refreshToken, loginData) => {
  return await Users.findByIdAndUpdate(
    userId,
    {
      $set: { refreshToken, lastLogin: Date.now() },
      $push: {
        loginHistory: {
          ip: loginData.ip || "unknown",
          device: loginData.device || "unknown",
          timestamp: Date.now(),
        },
      },
    },
    { new: true }
  ).select("-password -verificationCode -resetPasswordToken");
};
