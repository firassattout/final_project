import Joi from "joi";

export const validateAdData = (req, res, next) => {
  const { title, content, imageUrl, targetUrl } = req.body;

  if (!title || !content || !imageUrl || !targetUrl) {
    return res.status(400).json({
      error: "Missing required fields: title, content, imageUrl, targetUrl",
    });
  }

  if (
    typeof title !== "string" ||
    typeof content !== "string" ||
    typeof imageUrl !== "string" ||
    typeof targetUrl !== "string"
  ) {
    return res.status(400).json({
      error: "All fields must be strings",
    });
  }

  next();
};

export function validateRegisterUser(obj) {
  return Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    role: Joi.string().valid("admin", "advertiser", "partner").required(),
  }).validate(obj);
}

export function validateLoginUser(obj) {
  return Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(obj);
}
