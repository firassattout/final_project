import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";
import {
  validateFirstRegisterUser,
  validateLoginUser,
  validateSecondRegisterUser,
} from "../utils/validation.js";
import { generatePassword } from "../utils/generatePassword.js";
import userRepository from "../repositories/userRepository.mjs";
import logger from "../utils/logger.mjs";
import ExternalApiService from "../ExternalApiService.mjs";
import mongoose from "mongoose";

class AuthService {
  /**
   * Handle first user registration
   * @param {Object} data - User registration data
   * @returns {Promise<Object>} User data and tokens
   */
  async firstRegister(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { error } = validateFirstRegisterUser(data);
      if (error) throw new Error(error.details[0].message);

      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) throw new Error("البريد الإلكتروني موجود بالفعل");

      const tempPassword = generatePassword(8);
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(tempPassword, salt);

      const user = await userRepository.create(
        {
          ...data,
          state: "pending",
          createdAt: new Date(),
        },
        { session }
      );

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await userRepository.updateRefreshToken(user._id, refreshToken);

      if (data.role === "merchant") {
        await ExternalApiService.adMerchant({
          merchantMSISDN: data.mobileNumber,
        });
      }

      await session.commitTransaction();
      session.endSession();

      const { password, ...userWithoutPassword } = user._doc;

      logger.info(`User registered: ${user.email}`);

      return {
        user: userWithoutPassword,
        tempPassword,
        accessToken,
        refreshToken,
        message: "تم التسجيل بنجاح",
      };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  /**
   * Handle second registration step
   * @param {Object} data - Registration completion data
   * @param {Array} files - Uploaded files
   * @returns {Promise<Object>} Updated user data
   */
  async secondRegister(data, user, files) {
    const { error } = validateSecondRegisterUser(data);
    if (error) throw new Error(error.details[0].message);

    const findUser = await userRepository.findById(user.id);

    if (!findUser || findUser._id.toString() !== user.id) {
      throw new Error("البريد الإلكتروني غير موجود");
    }

    // Handle file upload (uncomment and configure as needed)
    /*
    if (files?.[0]) {
      const { id } = await upload(files[0], "1D11aejEkqYYQTPX5muychZvQxysUp3GN");
      if (id) {
        data.photo = `https://drive.google.com/thumbnail?id=${id}&sz=s300`;
      }
    }
    */

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const updatedUser = await userRepository.update(user.id, {
      state: "active",
      password: hashedPassword,
      // phone: data.phone,
      updatedAt: new Date(),
    });

    const { password, ...userWithoutPassword } = updatedUser;
    logger.info(`User completed registration: ${user.email}`);
    return {
      user: userWithoutPassword,
      message: "تم إكمال التسجيل بنجاح",
    };
  }

  /**
   * Handle user login
   * @param {Object} credentials - Email and password
   * @param {Object} loginData - Login metadata (ip, device)
   * @returns {Promise<Object>} User data and tokens
   */
  async login(credentials, loginData) {
    const { error } = validateLoginUser(credentials);
    if (error) throw new Error(error.details[0].message);

    const user = await userRepository.findByEmail(credentials.email);
    if (!user) throw new Error("بيانات تسجيل الدخول غير صحيحة");

    const isPasswordMatch = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!isPasswordMatch) throw new Error("بيانات تسجيل الدخول غير صحيحة");

    if (!user.isActive) throw new Error("الحساب غير نشط");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const updatedUser = await userRepository.updateLoginData(
      user._id,
      refreshToken,
      {
        ip: loginData.ip || "unknown",
        device: loginData.device || "unknown",
      }
    );

    const {
      password,
      verificationCode,
      resetPasswordToken,
      loginHistory,
      twoFactorAuth,
      isActive,
      ...userData
    } = updatedUser;
    logger.info(`User logged in: ${user.email}`);
    return {
      user: userData,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Deactivate user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deactivation result
   */
  async userDeactivation(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("المستخدم غير موجود");

    let updatedUser;
    if (user.isActive)
      updatedUser = await userRepository.deactivateUser(userId);
    if (!user.isActive) updatedUser = await userRepository.activateUser(userId);

    logger.info(`User deactivated: ${user.email}`);
    return { message: "تم تعديل حالة الحساب الحساب بنجاح", user: updatedUser };
  }

  /**
   * Get users by type or name
   * @param {string} type - User role
   * @param {string} name - User name
   * @returns {Promise<Object>} Users data
   */
  async getUser(type, name) {
    const users = await userRepository.findByType(type, name);
    if (!users.length) throw new Error("لا توجد بيانات للمستخدمين");
    return { users };
  }

  /**
   * Get company types
   * @returns {Promise<Object>} Company types data
   */
  async getCompanyType() {
    const companyTypes = await userRepository.findCompanyType();
    if (!companyTypes.length) throw new Error("لا توجد أنواع شركات متاحة");
    return { companyTypes };
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<string>} New access token
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error("رمز التحديث مطلوب");

    const decoded = jwt.verify(refreshToken, process.env.SECRET);

    const user = await userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("رمز التحديث غير صالح");
    }

    return generateAccessToken(user);
  }
}

export default new AuthService();
