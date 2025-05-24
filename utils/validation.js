import Joi from "joi";

export const validateFirstRegisterUser = (obj) => {
  return Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "البريد الإلكتروني غير صالح",
      "any.required": "البريد الإلكتروني مطلوب",
    }),
    role: Joi.string().valid("advertiser", "publisher").required().messages({
      "any.only": "الدور يجب أن يكون إما advertiser أو publisher",
      "any.required": "الدور مطلوب",
    }),
    name: Joi.string().min(3).max(50).required().messages({
      "string.min": "الاسم يجب أن يكون على الأقل 3 أحرف",
      "string.max": "الاسم يجب ألا يتجاوز 50 حرفًا",
      "any.required": "الاسم مطلوب",
    }),
    companyName: Joi.string().min(2).max(100).required().messages({
      "string.min": "اسم الشركة يجب أن يكون على الأقل حرفين",
      "string.max": "اسم الشركة يجب ألا يتجاوز 100 حرف",
      "any.required": "اسم الشركة مطلوب",
    }),
    companyType: Joi.string().required().messages({
      "any.required": "نوع الشركة مطلوب",
    }),
    mobileNumber: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .required()
      .messages({
        "string.pattern.base": "رقم الجوال غير صالح",
        "any.required": "رقم الجوال مطلوب",
      }),
    nationalId: Joi.string()
      .pattern(/^[0-9]{10,20}$/)
      .required()
      .messages({
        "string.pattern.base": "الرقم الوطني غير صالح",
        "any.required": "الرقم الوطني مطلوب",
      }),
    address: Joi.string().min(5).max(200).required().messages({
      "string.min": "العنوان يجب أن يكون على الأقل 5 أحرف",
      "string.max": "العنوان يجب ألا يتجاوز 200 حرف",
      "any.required": "العنوان مطلوب",
    }),
    phoneNumber: Joi.string()
      .pattern(/^\+?[0-9]{7,15}$/)
      .allow("")
      .messages({
        "string.pattern.base": "رقم الهاتف غير صالح",
      }),
    userIdFromToken: Joi.any().optional(),
    userRoleFromToken: Joi.any().optional(),
  }).validate(obj);
};
export function validateSecondRegisterUser(obj) {
  return Joi.object({
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
  }).validate(obj);
}
export function validateLoginUser(obj) {
  return Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "البريد الإلكتروني غير صالح",
      "any.required": "البريد الإلكتروني مطلوب",
    }),
    password: Joi.string().min(8).required().messages({
      "string.base": "كلمة المرور يجب أن تكون نصاً",
      "string.empty": "كلمة المرور مطلوبة",
      "string.min": "كلمة المرور يجب أن تحتوي على الأقل على 8 أحرف",
      "string.pattern.base":
        "يجب أن تحتوي كلمة المرور على: أحرف صغيرة، أحرف كبيرة، أرقام ورموز خاصة (@$!%*?&)",
      "any.required": "كلمة المرور مطلوبة",
    }),
  }).validate(obj);
}

export function validateCreateAd(obj) {
  return Joi.object({
    title: Joi.string().required().messages({
      "any.required": "عنوان الإعلان مطلوب",
      "string.empty": "عنوان الإعلان لا يمكن أن يكون فارغًا",
    }),
    description: Joi.string().allow("").messages({
      "string.base": "الوصف غير صالح",
    }),
    budget: Joi.number().required().messages({
      "any.required": "الميزانية مطلوبة",
      "number.base": "الميزانية يجب أن تكون رقمًا",
    }),
    url: Joi.string().messages({
      "any.required": "رابط الإعلان مطلوب عند اختيار CPC",
      "string.empty": "رابط الإعلان لا يمكن أن يكون فارغًا",
      "string.uri": "رابط الإعلان غير صالح",
    }),
    startDate: Joi.date().required().messages({
      "any.required": "تاريخ البدء مطلوب",
      "date.base": "تاريخ البدء غير صالح",
    }),
    endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
      "any.required": "تاريخ الانتهاء مطلوب",
      "date.base": "تاريخ الانتهاء غير صالح",
      "date.greater": "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
    }),
    platform: Joi.string().valid("web", "mobile").required().messages({
      "any.required": "المنصة مطلوبة",
      "any.only": "المنصة يجب أن تكون web أو mobile ",
    }),
    type: Joi.string()
      .valid("banner", "rewarded", "app_open")
      .required()
      .messages({
        "any.required": "نوع الإعلان مطلوب",
        "any.only": "نوع الإعلان غير صالح",
      }),
    pricingModel: Joi.string().valid("CPC", "CPM").required().messages({
      "any.required": "نموذج التسعير مطلوب",
      "any.only": "نموذج التسعير غير صالح",
    }),
    userIdFromToken: Joi.any().optional(),
    userRoleFromToken: Joi.any().optional(),
  }).validate(obj);
}
export function validateEditAd(obj) {
  return Joi.object({
    id: Joi.string().messages({
      "any.required": "id  مطلوب",
    }),
    title: Joi.string().messages({
      "any.required": "عنوان الإعلان مطلوب",
      "string.empty": "عنوان الإعلان لا يمكن أن يكون فارغًا",
    }),
    description: Joi.string().allow("").messages({
      "string.base": "الوصف غير صالح",
    }),
    url: Joi.string().messages({
      "any.required": "رابط الإعلان مطلوب",
      "string.empty": "رابط الإعلان لا يمكن أن يكون فارغًا",
      "string.uri": "رابط الإعلان غير صالح",
    }),
    budget: Joi.number().messages({
      "any.required": "الميزانية مطلوبة",
      "number.base": "الميزانية يجب أن تكون رقمًا",
    }),
    startDate: Joi.date().messages({
      "any.required": "تاريخ البدء مطلوب",
      "date.base": "تاريخ البدء غير صالح",
    }),
    endDate: Joi.date().greater(Joi.ref("startDate")).messages({
      "any.required": "تاريخ الانتهاء مطلوب",
      "date.base": "تاريخ الانتهاء غير صالح",
      "date.greater": "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
    }),
    platform: Joi.string().valid("web", "mobile").messages({
      "any.required": "المنصة مطلوبة",
      "any.only": "المنصة يجب أن تكون web أو mobile ",
    }),
    type: Joi.string()
      .valid("banner", "rewarded", "app_open")

      .messages({
        "any.required": "نوع الإعلان مطلوب",
        "any.only": "نوع الإعلان غير صالح",
      }),
    pricingModel: Joi.string().valid("CPC", "CPM").messages({
      "any.required": "نموذج التسعير مطلوب",
      "any.only": "نموذج التسعير غير صالح",
    }),
    userIdFromToken: Joi.any().optional(),
    userRoleFromToken: Joi.any().optional(),
  }).validate(obj);
}

export function validatevalueCheck(obj) {
  return Joi.object({
    budget: Joi.number().required().messages({
      "any.required": "الميزانية مطلوبة",
      "number.base": "الميزانية يجب أن تكون رقمًا",
    }),
    startDate: Joi.date().required().messages({
      "any.required": "تاريخ البدء مطلوب",
      "date.base": "تاريخ البدء غير صالح",
    }),
    endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
      "any.required": "تاريخ الانتهاء مطلوب",
      "date.base": "تاريخ الانتهاء غير صالح",
      "date.greater": "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
    }),
    platform: Joi.string().valid("web", "mobile", "both").required().messages({
      "any.required": "المنصة مطلوبة",
      "any.only": "المنصة يجب أن تكون web أو mobile أو both",
    }),
    type: Joi.string()
      .valid("banner", "rewarded", "app_open")
      .required()
      .messages({
        "any.required": "نوع الإعلان مطلوب",
        "any.only": "نوع الإعلان غير صالح",
      }),
    pricingModel: Joi.string().valid("CPC", "CPM").required().messages({
      "any.required": "نموذج التسعير مطلوب",
      "any.only": "نموذج التسعير غير صالح",
    }),
    userIdFromToken: Joi.any().optional(),
    userRoleFromToken: Joi.any().optional(),
  }).validate(obj);
}
export function validateAddMedia(obj) {
  return Joi.object({
    adId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "any.required": "معرف الإعلان مطلوب",
        "string.pattern.base": "معرف الإعلان غير صالح",
      }),

    mediaType: Joi.alternatives()
      .try(Joi.string().uri(), Joi.array().items(Joi.string().uri()))
      .valid("image", "video")
      .required()
      .messages({
        "any.required": "نوع الميديا مطلوب",
        "any.only": "نوع الميديا يجب أن يكون image أو video",
      }),
    userIdFromToken: Joi.any().optional(),
    userRoleFromToken: Joi.any().optional(),
  }).validate(obj);
}

export function validateEmbed(obj) {
  return Joi.object({
    type: Joi.string().valid("banner", "rewarded").required().messages({
      "any.required": "نوع الإعلان مطلوب",
      "any.only": "نوع الإعلان غير صالح",
    }),
    platform: Joi.string()
      .valid("web", "mobile", "react", "vue3")
      .required()
      .messages({
        "any.required": "المنصة مطلوبة",
        "any.only": "المنصة يجب أن تكون web أو mobile ",
      }),
    userIdFromToken: Joi.any().optional(),
    userRoleFromToken: Joi.any().optional(),
  }).validate(obj);
}
