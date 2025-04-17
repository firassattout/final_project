import { createFolder } from "../config/createFileForGroup.mjs";
import { uploadFile } from "../config/uploadFiles.mjs";
import {
  endTransactionWithFile,
  endTransaction,
  startTransaction,
} from "../middleware/transactionHandlers.mjs";
import { Backups, validateBackups } from "../models/Backups.mjs";
import { Files, validateFiles } from "../models/Files.mjs";
import FileRepository from "../repositories/FileRepository.mjs";
import { withTransaction } from "../middleware/transactionMiddleware.mjs";
import { diffLines } from "diff";
import { removeExtension } from "../config/removeExtinction.mjs";
import { fileTypeFromBuffer } from "file-type";
import mammoth from "mammoth";
import { logEvent } from "./tracingService.mjs";
import { GroupUser } from "../models/GroupUser.mjs";
import { deleteFile2 } from "../config/deleteFiles.mjs";
import GroupRepository from "../repositories/GroupRepository.mjs";
import groupsService from "./groupsService.mjs";
import { sendNotification } from "./notificationService.mjs";

const create = await withTransaction(
  startTransaction,
  endTransactionWithFile
)(async (req, context) => {
  let folder;
  let filePath;
  const { error } = validateFiles(req?.body);
  if (error) throw new Error(error.details[0].message);
  if (req?.files[0]) {
    const group = await GroupRepository.findById(req.body.groupId);
    const groupUser = await GroupRepository.GroupUserFindOne({
      userId: req.body?.IdFromToken,
      groupId: group?.id,
    });

    if (!groupUser) {
      throw new Error("Error groupUser");
    }
    if (group.filesFolder)
      folder = await createFolder(
        removeExtension(req?.files[0].originalname),
        group.filesFolder
      );
    context.folder = folder;
    if (folder) {
      const { id } = await uploadFile(
        req?.files[0],
        folder,
        req?.files[0].originalname
      );
      if (id) {
        filePath = `https://drive.usercontent.google.com/download?id=${id}&export=download`;
      } else throw new Error("Error");
    }
    if (filePath) {
      const file = await FileRepository.createFile({
        name: req?.files[0]?.originalname,
        status: "open",
        groupId: req.body.groupId,
        addedBy: req.body.IdFromToken,
        filesFolder: folder,
        acceptedByAdmin: groupUser.role === "admin" || false,
      });

      const Backup = await new Backups({
        filePath: filePath,
        fileId: file.id,
        addedBy: req.body.IdFromToken,
      }).save();
      await logEvent(
        "File Upload",
        req.body.IdFromToken,
        file.name + " added to " + group.name,

        file.id
      );

      const groupUsers = await groupsService.showUsers(req.body);
      const notificationMessage = `A New File : ${file.name}, has been added to the group: ${group.name}`;
      const notificationPromises = groupUsers?.result?.map(async (user) => {
        sendNotification(user.userId, notificationMessage);
      });
      await Promise.all(notificationPromises);

      return { file, Backup, message: "added successfully" };
    } else throw new Error("Error");
  } else throw new Error("file not found");
});
const update = async (req) => {
  const { error } = validateBackups(req?.body);
  if (error) throw new Error(error.details[0].message);
  let filePath;
  const file = await FileRepository.findById(req.body.fileId);

  if (!file.filesFolder) {
    throw new Error("Error");
  }
  if (req?.files[0] && req?.files[0].originalname !== file.name) {
    throw new Error("File name is different");
  }
  if (
    file.status !== "close" &&
    file.reservedBy?.toString() !== req.body.IdFromToken
  ) {
    throw new Error("The file is not reserved.");
  }

  const backups = await FileRepository.findBackups({ fileId: file.id });

  const { id } = await uploadFile(req?.files[0], file.filesFolder, file.name);

  if (id) {
    filePath = `https://drive.usercontent.google.com/download?id=${id}&export=download`;
  } else throw new Error("Error");

  if (filePath) {
    const Backup = await new Backups({
      filePath: filePath,
      commit: req.body.commit,
      fileId: file.id,
      addedBy: req.body.IdFromToken,
    }).save();

    await FileRepository.findByIdAndUpdate(file._id, {
      $set: { status: "open", reservedBy: null },
    });

    await logEvent(
      "File Update",
      req.body.IdFromToken,
      file.name + " updated",
      file.id
    );
    const group = await GroupRepository.findById(file.groupId);

    req.body.groupId = file.groupId;
    const groupUsers = await groupsService.showUsers(req.body);
    const notificationMessage = ` ${file.name} file has been modified in: ${group.name} group`;

    await Promise.all(
      groupUsers?.result?.map((user) =>
        sendNotification(user.userId, notificationMessage)
      )
    );

    return { Backup, message: "added successfully" };
  } else throw new Error("Error");
};

const differences = async (req, res) => {
  const backup1 = await FileRepository.findByIdBackups(req.body.id1);
  const backup2 = await FileRepository.findByIdBackups(req.body.id2);

  if (!backup1 || !backup2) throw new Error("Error");
  const fileUrl1 = backup1?.filePath;
  const fileUrl2 = backup2?.filePath;

  if (!fileUrl1 || !fileUrl2) {
    return res.status(400).json({ error: "Both file URLs are required." });
  }

  try {
    const [file1Response, file2Response] = await Promise.all([
      fetch(fileUrl1),
      fetch(fileUrl2),
    ]);

    const [file1Buffer, file2Buffer] = await Promise.all([
      file1Response.arrayBuffer().then((buf) => Buffer.from(buf)),
      file2Response.arrayBuffer().then((buf) => Buffer.from(buf)),
    ]);
    const [file1Type, file2Type] = await Promise.all([
      fileTypeFromBuffer(file1Buffer),
      fileTypeFromBuffer(file2Buffer),
    ]);

    const isWordFile = (fileType) =>
      fileType?.mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // .docx
      fileType?.mime === "application/msword"; // .doc

    let text1, text2;

    if (isWordFile(file1Type) && isWordFile(file2Type)) {
      text1 = (
        await mammoth.extractRawText({ buffer: file1Buffer })
      ).value.trim();
      text2 = (
        await mammoth.extractRawText({ buffer: file2Buffer })
      ).value.trim();
    } else {
      text1 = file1Buffer.toString("utf-8");
      text2 = file2Buffer.toString("utf-8");
    }

    const differences = diffLines(text2, text1);

    let modifiedFileContent = "";
    differences.forEach((part) => {
      if (part.added) {
        modifiedFileContent += `new: ${part.value} \n`;
      } else if (part.removed) {
        modifiedFileContent += `\n old: ${part.value} `;
      } else {
        modifiedFileContent += part.value;
      }
    });

    res.send(modifiedFileContent);
  } catch (error) {
    console.error("Error comparing files:", error);
    throw Error("An error occurred while comparing files.");
  }
};

const show = async (data) => {
  const files = await Files.find({
    groupId: data?.params?.groupId,
    acceptedByAdmin: true,
  })
    .populate("addedBy", "name")
    .lean();

  for (const f of files) {
    const backups = await Backups.findOne({
      fileId: f._id,
    }).sort({
      createdAt: -1,
    });
    f.filePath = backups.filePath;
    f.isYouReserved =
      f.reservedBy?.toString() === data.body.IdFromToken || false;
  }
  return files;
};

const checkIn = await withTransaction(
  startTransaction,
  endTransaction
)(async (data, res, context) => {
  if (!data.body.filesId) {
    throw new Error("Error");
  }

  for (const file of data.body.filesId) {
    const result = await Files.findByIdAndUpdate(file, {
      $set: { status: "close", reservedBy: data.body.IdFromToken },
    }).session(context.session);

    if (!result || result.status === "close") {
      throw new Error("File update failed or already closed");
    }
    await logEvent(
      "File checkIn",
      data.body.IdFromToken,
      "reversed " + result.name + " file",
      result.id
    );
    const group = await GroupRepository.findById(result.groupId);
    const groupUsers = await groupsService.showUsers({ groupId: group.id });
    const notificationMessage = `The file: ${result.name} has been reserved in the group: ${group.name}`;
    const notificationPromises = groupUsers?.result?.map(async (user) => {
      sendNotification(user.userId, notificationMessage);
    });
    await Promise.all(notificationPromises);
  }

  return { message: "reserved successfully" };
});

const checkOut = async (data) => {
  if (!data.body.fileId) {
    throw new Error("Error");
  }
  const file = await FileRepository.findById(data.body.fileId);

  if (file.reservedBy?.toString() === data.body.IdFromToken) {
    const result = await FileRepository.findByIdAndUpdate(data.body.fileId, {
      $set: { status: "open", reservedBy: null },
    });

    if (!result || result.status === "open") {
      throw new Error("File update failed or already open");
    }
    await logEvent(
      "File checkOut",
      data.body.IdFromToken,
      "canceled revers " + file.name + " file",
      result.id
    );
    const group = await GroupRepository.findById(result.groupId);
    const groupUsers = await groupsService.showUsers({ groupId: group.id });
    const notificationMessage = `The reservation for the file: ${result.name} has been released in the group: ${group.name}`;
    const notificationPromises = groupUsers?.result?.map(async (user) => {
      sendNotification(user.userId, notificationMessage);
    });
    await Promise.all(notificationPromises);
    return { message: "opened successfully" };
  } else throw new Error("you don't have access");
};

const showBackups = async (data) => {
  if (!data.body.fileId) {
    throw new Error("Error");
  }
  const backups = await Backups.find({ fileId: data.body.fileId })
    .sort({
      createdAt: -1,
    })
    .populate("addedBy", "name");

  if (!backups) {
    throw new Error("File update failed or already open");
  }
  return backups;
};
const deleteFile = async (data) => {
  const file = await FileRepository.findById(data.params?.fileId);
  const groupUser = await GroupUser.findOne({
    userId: data.body?.IdFromToken,
    groupId: file.groupId,
  });

  if (groupUser.role !== "admin") {
    throw new Error("you are not admin");
  }
  const files = await FileRepository.findByIdAndDelete(data.params.fileId);
  if (files) await deleteFile2(files.filesFolder);

  return { message: "Deleted File successfully" };
};
export default {
  create,
  show,
  update,
  differences,
  checkIn,
  checkOut,
  showBackups,
  deleteFile,
};
