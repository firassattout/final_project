import { Users } from "../models/Users.mjs";

class UserRepository {
  async findByEmail(email) {
    return await Users.findOne({ email });
  }

  async create(userData) {
    const user = new Users(userData);
    return await user.save();
  }

  async update(userId, data) {
    return await Users.findByIdAndUpdate(userId, data, { new: true });
  }

  async updateRefreshToken(userId, refreshToken) {
    return await Users.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  }

  async findById(id) {
    return await Users.findById(id);
  }

  async findByType(type, name) {
    return await Users.find({
      ...(type && { role: type }),
      ...(name && { name: { $regex: name, $options: "i" } }),
    }).select(
      "-loginHistory -loginHistory -password -lastLogin -refreshToken -updatedAt -createdAt"
    );
  }

  async updateLoginData(userId, refreshToken, loginData = {}) {
    return await Users.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken,
          lastLogin: Date.now(),
        },
        $push: {
          loginHistory: {
            ip: loginData.ip || "unknown",
            device: loginData.device || "unknown",
            timestamp: Date.now(),
          },
        },
      },
      {
        new: true,
      }
    ).select("-password -verificationCode -resetPasswordToken");
  }

  async deactivateUser(userId) {
    return await Users.findByIdAndUpdate(
      userId,
      { state: "inactive" },
      { new: true }
    );
  }

  async countUsersByRole(role) {
    return await Users.countDocuments({ role });
  }
}

export default new UserRepository();
