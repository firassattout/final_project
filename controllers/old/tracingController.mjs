import asyncHandler from "express-async-handler";
import {
  exportTracesAsCSV,
  exportTracesAsPDF,
  exportTracesAsText,
  getTraces,
  TracesGroup,
} from "../Services/tracingService.mjs";
import { Users } from "../models/Users.mjs";
import { Tracing } from "../models/Tracing.mjs";

export const TracesGroupController = asyncHandler(async (req, res) => {
  req.body.groupId = req.params.groupId;
  const result = await TracesGroup(req);
  res.json(result);
});

export const TracesFileController = asyncHandler(async (req, res) => {
  req.body.fileId = req.params.fileId;
  const result = await getTraces(req);
  res.json(result);
});

export const TracesExportTracesAsTextController = asyncHandler(
  async (req, res) => {
    let result;
    if (req.body.fileId) {
      result = await getTraces(req);
    } else if (req.body.groupId) {
      result = await TracesGroup(req);
    } else {
      const user = await Users.findById(req.body.IdFromToken);
      if (user?.role != "admin")
        return res.json({ message: "you are not admin" });
      else result = await Tracing.find();
    }
    if (result) {
      const filePath = await exportTracesAsText(result, "./exports");
      res.download(filePath);
    } else throw new Error("error");
  }
);
export const TracesExportTracesAsPdfController = asyncHandler(
  async (req, res) => {
    let result;
    if (req.body.fileId) {
      result = await getTraces(req);
    } else if (req.body.groupId) {
      result = await TracesGroup(req);
    } else {
      const user = await Users.findById(req.body.IdFromToken);
      if (user?.role != "admin")
        return res.json({ message: "you are not admin" });
      else result = await Tracing.find();
    }
    if (result) {
      const filePath = await exportTracesAsPDF(result, "./exports");
      res.download(filePath);
    } else throw new Error("error");
  }
);
export const TracesExportTracesAsCSVController = asyncHandler(
  async (req, res) => {
    let result;
    if (req.body.fileId) {
      result = await getTraces(req);
    } else if (req.body.groupId) {
      result = await TracesGroup(req);
    } else {
      const user = await Users.findById(req.body.IdFromToken);
      if (user?.role != "admin")
        return res.json({ message: "you are not admin" });
      else result = await Tracing.find();
    }
    if (result) {
      const filePath = await exportTracesAsCSV(result, "./exports");
      res.download(filePath);
    } else throw new Error("error");
  }
);
