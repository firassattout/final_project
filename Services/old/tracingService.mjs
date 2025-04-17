import { Tracing } from "../models/Tracing.mjs";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { createObjectCsvWriter } from "csv-writer";
import FileRepository from "../repositories/FileRepository.mjs";
import GroupRepository from "../repositories/GroupRepository.mjs";

export const logEvent = async (action, userId, details, fileId) => {
  try {
    await Tracing.create({
      action,
      user: userId,
      details,

      fileId,
    });
  } catch (error) {
    console.error("Error logging event:", error.message);
  }
};

export const getTraces = async (req) => {
  if (!req?.body?.fileId) {
    throw new Error("id not found");
  }
  const file = await FileRepository.findById(req.body?.fileId);
  const groupUser = await GroupRepository.GroupUserFindOne({
    userId: req.body?.IdFromToken,
    groupId: file.groupId,
  });

  if (!groupUser.role) {
    throw new Error("you are not in this group");
  }
  const traces = await Tracing.find({ fileId: file.id })
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  return traces;
};

export const TracesGroup = async (req) => {
  if (!req?.params?.groupId) {
    throw new Error("id not found");
  }

  const groupUser = await GroupRepository.GroupUserFindOne({
    userId: req.body?.IdFromToken,
    groupId: req?.params?.groupId,
  });

  if (groupUser.role !== "admin") {
    throw new Error("you are not admin in this group");
  }
  const files = await FileRepository.find({ groupId: req?.params?.groupId });
  const ids = files.map((file) => file.id);
  const traces = await Tracing.find({ fileId: { $in: [...ids] } })
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  return traces;
};

export const exportTracesAsText = async (traces, outputPath) => {
  const filePath = path.resolve(outputPath, "traces.txt");

  let content = "Tracing Report\n\n";
  traces.forEach((trace, index) => {
    content += `Event ${index + 1}:\n`;
    content += `Action: ${trace.action}\t`;
    content += `User: ${trace.user.name} (${trace.user.email})\t`;
    content += `Details: ${JSON.stringify(trace.details, null, 2)}\n`;
    content += `Timestamp: ${trace.createdAt}\n\n`;
  });

  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
};

export const exportTracesAsPDF = async (traces, outputPath) => {
  const filePath = path.resolve(outputPath, "traces.pdf");
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text("Tracing Report", { underline: true, align: "center" });
  doc.moveDown();

  traces.forEach((trace, index) => {
    doc.fontSize(10).text(`Event ${index + 1}:`, { bold: true });
    doc.text(
      `Action: ${trace.action}     User: ${trace.user?.name} (${
        trace.user?.email
      })   Details: ${JSON.stringify(trace.details, null, 2)}`
    );

    doc.text(`Timestamp: ${trace.createdAt}`);
    doc.moveDown();
  });

  doc.end();
  return filePath;
};

export const exportTracesAsCSV = async (traces, outputPath) => {
  const filePath = path.resolve(outputPath, "traces.csv");

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "action", title: "Action" },
      { id: "user", title: "User" },
      { id: "details", title: "Details" },
      { id: "timestamp", title: "Timestamp" },
    ],
  });

  const records = traces.map((trace) => ({
    action: trace.action,
    user: `${trace.user.name} (${trace.user.email})`,
    details: JSON.stringify(trace.details, null, 2),
    timestamp: trace.createdAt,
  }));

  await csvWriter.writeRecords(records);
  return filePath;
};
