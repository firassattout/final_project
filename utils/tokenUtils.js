import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.SECRET, {
    expiresIn: "30d",
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "30d" });
};
