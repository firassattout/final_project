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

export function validateFirstRegisterUser(obj) {
  return Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    role: Joi.string().valid("advertiser", "partner").required(),
  }).validate(obj);
}
export function validateSecondRegisterUser(obj) {
  return Joi.object({
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.base": "رقم الهاتف يجب أن يكون نصاً",
        "string.empty": "رقم الهاتف مطلوب",
        "string.pattern.base": "يجب أن يتكون رقم الهاتف من 10 أرقام فقط",
        "any.required": "رقم الهاتف مطلوب",
      }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"))
      .required()
      .messages({
        "string.base": "كلمة المرور يجب أن تكون نصاً",
        "string.empty": "كلمة المرور مطلوبة",
        "string.min": "كلمة المرور يجب أن تحتوي على الأقل على 8 أحرف",
        "string.pattern.base":
          "يجب أن تحتوي كلمة المرور على: أحرف صغيرة، أحرف كبيرة، أرقام ورموز خاصة (@$!%*?&)",
        "any.required": "كلمة المرور مطلوبة",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "string.base": "تأكيد كلمة المرور يجب أن يكون نصاً",
        "string.empty": "تأكيد كلمة المرور مطلوب",
        "any.only": "كلمة المرور غير متطابقة",
        "any.required": "تأكيد كلمة المرور مطلوب",
      }),
    userIdFromToken: Joi.any().optional(),
    userRoleFromToken: Joi.any().optional(),
    photo: Joi.any().optional(),
  }).validate(obj);
}
export function validateLoginUser(obj) {
  return Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(obj);
}
