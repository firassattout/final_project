import dotenv from "dotenv";
import { CompanyType } from "../models/CompanyTypeModel.mjs";
import connectDb from "../config/conectDb.mjs";

dotenv.config();

const companyTypes = [
  {
    name: "عقارات",
    priceRating: 5,
    priceDescription:
      "أعلى أسعار إعلانات بسبب المنافسة العالية وقيمة العميل المرتفعة",
  },
  {
    name: "تمويل وبنوك",
    priceRating: 5,
    priceDescription: "إعلانات باهظة الثمن بسبب قيمة التحويل العالية",
  },
  {
    name: "سيارات",
    priceRating: 4,
    priceDescription: "أسعار إعلانات مرتفعة مع منافسة متوسطة",
  },
  {
    name: "تكنولوجيا",
    priceRating: 4,
    priceDescription: "أسعار إعلانات فوق المتوسط بسبب القطاع المربح",
  },
  {
    name: "صحة وتجميل",
    priceRating: 3,
    priceDescription: "أسعار متوسطة مع منافسة معتدلة",
  },
  {
    name: "تعليم",
    priceRating: 3,
    priceDescription: "أسعار إعلانات متوسطة",
  },
  {
    name: "تجزئة",
    priceRating: 2,
    priceDescription: "أسعار منخفضة بسبب هوامش ربح ضيقة",
  },
  {
    name: "أدوات مكتبية",
    priceRating: 2,
    priceDescription: "إعلانات منخفضة التكلفة",
  },
  {
    name: "خدمات منزلية",
    priceRating: 2,
    priceDescription: "أسعار إعلانات اقتصادية",
  },
  {
    name: "أخرى",
    priceRating: 1,
    priceDescription: "فئة عامة بأسعار منخفضة",
  },
];

const seedCompanyTypes = async () => {
  try {
    await connectDb();

    await CompanyType.deleteMany({});

    await CompanyType.insertMany(companyTypes);

    console.log("✅ تم إنشاء أنواع الشركات بنجاح!");
    process.exit(0);
  } catch (error) {
    console.error("❌ فشل في تنفيذ السيدر:", error);
    process.exit(1);
  }
};

seedCompanyTypes();
