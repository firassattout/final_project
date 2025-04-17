import { Files } from "../models/Files.mjs";
import { Users } from "../models/Users.mjs";
import FileRepository from "../repositories/FileRepository.mjs";
import GroupRepository from "../repositories/GroupRepository.mjs";

const search = async (data) => {
  const users = await Users.find({
    email: data?.email,
  });
  return users;
};

const fileRequireAcceptForAdmin = async (req) => {
  const groupUser = await GroupRepository.GroupUserFindOne({
    userId: req.body?.IdFromToken,
    groupId: req?.params?.groupId,
  });
  if (!groupUser) {
    throw new Error(" not found");
  }
  if (groupUser?.role !== "admin") {
    throw new Error("you not admin");
  }
  const files = await Files.find({
    groupId: req?.params?.groupId,
    acceptedByAdmin: false,
  }).populate("addedBy", "name");
  return files;
};
const fileRequireAcceptForUser = async (req) => {
  const files = await Files.find({
    groupId: req?.params?.groupId,
    addedBy: req?.body?.IdFromToken,
    acceptedByAdmin: false,
  }).populate("addedBy", "name");
  return files;
};

const acceptFile = async (req) => {
  if (!req?.params?.fileId) {
    throw new Error("id not found");
  }
  const file = await FileRepository.findById(req.params?.fileId);
  const groupUser = await GroupRepository.GroupUserFindOne({
    userId: req.body?.IdFromToken,
    groupId: file.groupId,
  });

  if (groupUser.role !== "admin") {
    throw new Error("you are not admin");
  }
  await FileRepository.findByIdAndUpdate(req.params?.fileId, {
    $set: { acceptedByAdmin: true },
  });

  return { message: "accepted successfully" };
};

const rejectFile = async (req) => {
  if (!req?.params?.fileId) {
    throw new Error("id not found");
  }
  const file = await FileRepository.findById(req.params?.fileId);
  const groupUser = await GroupRepository.GroupUserFindOne({
    userId: req.body?.IdFromToken,
    groupId: file.groupId,
  });

  if (groupUser.role !== "admin") {
    throw new Error("you are not admin");
  }
  const files = await FileRepository.findByIdAndDelete(data.params.fileId);
  if (files) await deleteFile2(files.filesFolder);

  return { message: "rejected successfully" };
};

export default {
  search,
  fileRequireAcceptForAdmin,
  fileRequireAcceptForUser,
  acceptFile,
  rejectFile,
};
