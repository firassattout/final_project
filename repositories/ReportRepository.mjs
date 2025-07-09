import mongoose from "mongoose";
import { Report } from "../models/ReportModel.mjs";
import logger from "../utils/logger.mjs";
import { t } from "i18next";

const isValidObjectId = mongoose.isValidObjectId;

async function create({ adId, userId, message, reportedAt }) {
  if (!isValidObjectId(adId)) {
    logger.warn(`Invalid ad ID: ${adId}`);
    throw new Error(t("report.invalid_ad_id"));
  }
  if (!isValidObjectId(userId)) {
    logger.warn(`Invalid user ID: ${userId}`);
    throw new Error(t("report.invalid_user_id"));
  }
  if (!message || message.length < 5 || message.length > 500) {
    logger.warn(`Invalid report message: ${message}`);
    throw new Error(t("report.invalid_message"));
  }

  try {
    const report = await Report.create({
      adId,
      userId,
      message,
      reportedAt,
    });
    logger.info(`Report created for ad: ${adId} by user: ${userId}`);
    return report;
  } catch (error) {
    logger.error(`Error creating report: ${error.message}`);
    throw new Error(t("report.create_failed"));
  }
}
async function updateStatusToReviewed(reportIds) {
  try {
    await Report.updateMany(
      { _id: { $in: reportIds }, status: "pending" },
      { $set: { status: "reviewed" } }
    );
    logger.info(
      `Updated status to reviewed for reports: ${reportIds.join(", ")}`
    );
  } catch (error) {
    logger.error(`Error updating report status: ${error.message}`);
    throw new Error(t("report.update_status_failed"));
  }
}

async function findReports({ adId, userId, page = 1, limit = 10 }) {
  if (adId && !isValidObjectId(adId)) {
    logger.warn(`Invalid ad ID: ${adId}`);
    throw new Error(t("report.invalid_ad_id"));
  }
  if (userId && !isValidObjectId(userId)) {
    logger.warn(`Invalid user ID: ${userId}`);
    throw new Error(t("report.invalid_user_id"));
  }
  if (!Number.isInteger(page) || page < 1) {
    logger.warn(`Invalid page number: ${page}`);
    throw new Error(t("report.invalid_page"));
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    logger.warn(`Invalid limit: ${limit}`);
    throw new Error(t("report.invalid_limit"));
  }

  try {
    const query = {};
    if (adId) query.adId = adId;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;
    const [reports, totalItems] = await Promise.all([
      Report.find(query)
        .populate("adId", "title description")
        .populate("userId", "email")
        .select("-__v")
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // جمع معرفات التقارير التي بحالة "pending" لتحديثها بعد إرجاع البيانات
    const pendingReportIds = reports
      .filter((report) => report.status === "pending")
      .map((report) => report._id);

    // إرجاع البيانات أولاً
    const result = {
      reports,
      totalItems,
      totalPages,
      currentPage: page,
      limit,
    };

    // تحديث حالة التقارير إلى "reviewed" بعد الإرجاع
    if (pendingReportIds.length > 0) {
      await updateStatusToReviewed(pendingReportIds);
    }

    logger.info(
      `Retrieved ${reports.length} reports, page: ${page}, limit: ${limit}, totalItems: ${totalItems}`
    );

    return result;
  } catch (error) {
    logger.error(`Error finding reports: ${error.message}`);
    throw new Error(t("report.find_failed"));
  }
}
async function countPendingReports() {
  try {
    const count = await Report.countDocuments({ status: "pending" });
    logger.info(`Counted ${count} pending reports`);
    return count;
  } catch (error) {
    logger.error(`Error counting pending reports: ${error.message}`);
    throw new Error(t("report.count_pending_failed"));
  }
}
export default { create, findReports, countPendingReports };
