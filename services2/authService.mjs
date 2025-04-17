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
import { validateLoginUser, validateRegisterUser } from "../models/Users.mjs";

export const register = async (data) => {
  const { error } = validateRegisterUser(data);
  if (error) throw new Error(error.details[0].message);

  let user = await findUserByEmail(data.email);
  if (user) throw new Error("This email already exists");

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
    message: "User registered successfully",
  };
};

export const login = async (data) => {
  const { error } = validateLoginUser(data);
  if (error) throw new Error(error.details[0].message);

  const user = await findUserByEmail(data.email);
  if (!user) throw new Error("Username or password is incorrect");

  const isPasswordMatch = await bcrypt.compare(data.password, user.password);
  if (!isPasswordMatch) throw new Error("Username or password is incorrect");

  const access_token = generateAccessToken(user);
  const refresh_token = generateRefreshToken(user);

  await updateUserRefreshToken(user._id, refresh_token);

  const { password, ...userWithoutPassword } = user._doc;

  return { ...userWithoutPassword, access_token };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token is required");

  const decoded = jwt.verify(refreshToken, process.env.SECRET);
  const user = await findUserById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  return generateAccessToken(user);
};
