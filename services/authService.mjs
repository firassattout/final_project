import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";
import {
  findUserByEmail,
  createUser,
  updateUserRefreshToken,
  findUserById,
} from "../repositories/userRepository.mjs";
import {
  validateLoginUser,
  validateRegisterUser,
} from "../utils/validation.js";
import i18next from "i18next";
import { generatePassword } from "../utils/generatePassword.js";

export const firstRegister = async (data, req) => {
  const { error } = validateRegisterUser(data);
  if (error) throw new Error(i18next.t(error.details[0].message));

  let user = await findUserByEmail(data.email);
  if (user) throw new Error(i18next.t("auth.email_exists"));

  const tempPassword = generatePassword(8);
  user = await createUser({
    name: data.name,
    email: data.email,
    password: tempPassword,
  });

  const access_token = generateAccessToken(user);
  const refresh_token = generateRefreshToken(user);

  await updateUserRefreshToken(user._id, refresh_token);

  return {
    user,
    access_token,
    message: i18next.t("auth.register_success"),
  };
};

export const secondRegister = async (data, req) => {
  const { error } = validateRegisterUser(data);
  if (error) throw new Error(i18next.t(error.details[0].message));

  let user = await findUserByEmail(data.email);
  if (user) throw new Error(i18next.t("auth.email_exists"));

  const salt = await bcrypt.genSalt(5);
  data.password = await bcrypt.hash(data.password, salt);

  user = await createUser({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  const access_token = generateAccessToken(user);
  const refresh_token = generateRefreshToken(user);

  await updateUserRefreshToken(user._id, refresh_token);

  const { password, ...userWithoutPassword } = user._doc;

  return {
    ...userWithoutPassword,
    access_token,
    message: i18next.t("auth.register_success"),
  };
};

export const login = async (data, req) => {
  const { error } = validateLoginUser(data);
  if (error) throw new Error(i18next.t(error.details[0].message));

  const user = await findUserByEmail(data.email);
  if (!user) throw new Error(i18next.t("auth.login_error"));

  const isPasswordMatch = await bcrypt.compare(data.password, user.password);
  if (!isPasswordMatch) throw new Error(i18next.t("auth.login_error"));

  const access_token = generateAccessToken(user);
  const refresh_token = generateRefreshToken(user);

  await updateUserRefreshToken(user._id, refresh_token);

  const { password, ...userWithoutPassword } = user._doc;

  return { ...userWithoutPassword, access_token };
};

export const refreshAccessToken = async (refreshToken, req) => {
  if (!refreshToken) throw new Error(i18next.t("auth.refresh_token_required"));

  const decoded = jwt.verify(refreshToken, process.env.SECRET);
  const user = await findUserById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error(i18next.t("auth.invalid_refresh_token"));
  }

  return generateAccessToken(user);
};
