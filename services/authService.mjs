import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { t } from "i18next";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";

import {
  findUserByEmail,
  createUser,
  updateUserRefreshToken,
  findUserById,
  updateUser,
  updateLoginData,
} from "../repositories/userRepository.mjs";

import {
  validateFirstRegisterUser,
  validateLoginUser,
  validateSecondRegisterUser,
} from "../utils/validation.js";

import { generatePassword } from "../utils/generatePassword.js";
import { upload } from "../config/uploadImage.mjs";

class AuthService {
  async firstRegister(data) {
    const { error } = validateFirstRegisterUser(data);
    if (error) throw new Error(t(error.details[0].message));

    let user = await findUserByEmail(data.email);
    if (user) throw new Error(t("auth.email_exists"));

    const tempPassword = generatePassword(8);
    const salt = await bcrypt.genSalt(5);
    data.password = await bcrypt.hash(tempPassword, salt);

    user = await createUser(data);

    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    await updateUserRefreshToken(user._id, refresh_token);
    const { password, ...userWithoutPassword } = user._doc;
    return {
      user: userWithoutPassword,
      tempPassword,
      access_token,
      message: t("auth.register_success"),
    };
  }

  async secondRegister(data) {
    const { error } = validateSecondRegisterUser(data.body);
    if (error) throw new Error(t(error.details[0].message));

    let user = await findUserById(data.body.userIdFromToken);

    if (!user) throw new Error(t("auth.email_not_exists"));
    if (user.id !== data.body.userIdFromToken)
      throw new Error(t("auth.email_not_exists"));

    // if (data?.files[0]) {
    //   const { id } = await upload(
    //     data?.files[0],
    //     "1D11aejEkqYYQTPX5muychZvQxysUp3GN"
    //   );
    //   if (id) {
    //     data.body.photo = `https://drive.google.com/thumbnail?id=${id}&sz=s300`;
    //   }
    // }

    const salt = await bcrypt.genSalt(5);
    data.body.password = await bcrypt.hash(data.body.password, salt);

    user = await updateUser(user._id, {
      state: "active",
      // photo: data.body.photo,
      // phone: data.body.phone,
      password: data.body.password,
    });

    const { password, ...userWithoutPassword } = user._doc;

    return {
      ...userWithoutPassword,

      message: t("auth.register_success"),
    };
  }

  async login(data) {
    const { error } = validateLoginUser(data.body);
    if (error) throw new Error(error.details[0].message);

    const user = await findUserByEmail(data.body.email);
    if (!user) throw new Error("بيانات الدخول غير صحيحة");

    const isPasswordMatch = await bcrypt.compare(
      data.body.password,
      user.password
    );
    if (!isPasswordMatch) throw new Error("بيانات الدخول غير صحيحة");

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const updatedUser = await updateLoginData(user._id, refreshToken, {
      ip: data?.id || "",
      device: data?.headers["user-agent"] || "",
    });
    const {
      password,
      verificationCode,
      resetPasswordToken,
      loginHistory,
      lastLogin,
      ...userData
    } = updatedUser._doc;

    return {
      ...userData,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error(t("auth.refresh_token_required"));

    const decoded = jwt.verify(refreshToken, process.env.SECRET);
    const user = await findUserById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error(t("auth.invalid_refresh_token"));
    }

    return generateAccessToken(user);
  }
}

export default AuthService;
