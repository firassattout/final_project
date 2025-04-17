import { createFolder } from "../config/createFileForGroup.mjs";
import { upload } from "../config/uploadImage.mjs";
import {
  endTransactionWithFile,
  startTransaction,
} from "../middleware/transactionHandlers.mjs";
import { withTransaction } from "../middleware/transactionMiddleware.mjs";
import { validateGroups } from "../models/Groups.mjs";
import { GroupUser } from "../models/GroupUser.mjs";
import { Users } from "../models/Users.mjs";
import GroupRepository from "../repositories/GroupRepository.mjs";
import { sendNotification } from "./notificationService.mjs";
import { logEvent } from "./tracingService.mjs";

const create = await withTransaction(
  startTransaction,
  endTransactionWithFile
)(async (req, context) => {
  const { error } = validateGroups(req?.body);
  if (error) throw new Error(error.details[0].message);

  const folder = await createFolder(
    req.body.name,
    "1uYReipLqkGHRBMV2-2quOkiOaqtx5FL0"
  );
  if (folder) {
    context.folder = folder;
    if (req?.files[0]) {
      const { id } = await upload(req?.files[0], folder);
      if (id) {
        req.body.photo = `https://drive.google.com/thumbnail?id=${id}&sz=s300`;
      }
    }
    const groups = await GroupRepository.createGroups({
      ...req?.body,
      filesFolder: folder,
    });

    await GroupRepository.newGroupUser({
      groupId: groups?.id,
      userId: req?.body?.IdFromToken,
      role: "admin",
    });

    await logEvent(
      "Group Create",
      req.body.IdFromToken,
      "the group: " + groups.name + " created",
      null
    );
    return { groups, message: "added successfully  " };
  } else {
    return { message: "error" };
  }
});

const show = async (data) => {
  const groupUser = await GroupUser.find({
    userId: data?.body.IdFromToken,
  }).populate("groupId");
  return groupUser;
};

const showUsers = async (data) => {
  const groupUser = await GroupUser.find({
    groupId: data?.groupId,
  }).populate("userId");
  const result = groupUser.map((i) => {
    const data = {
      name: i?.userId?.name,
      email: i?.userId?.email,
      role: i?.role,
      userId: i?.id,
    };
    return data;
  });
  return { result, AllNumber: result.length };
};

const addUser = async (data) => {
  if (!data.userId || !data.groupId) {
    throw new Error("data not found");
  }

  const admin = await GroupRepository.GroupUserFindOne({
    userId: data?.IdFromToken,
    groupId: data.groupId,
  });

  if (admin && admin.role !== "admin") {
    throw new Error("you haven't access for this group");
  }
  const added = await GroupRepository.GroupUserFindOne({
    userId: data?.userId,
    groupId: data?.groupId,
  });
  if (added) {
    return { message: "This user is already added." };
  }
  const result = await GroupRepository.newGroupUser({
    userId: data?.userId,
    groupId: data?.groupId,
  });

  if (!result) {
    throw new Error("group or user not found");
  }

  const user = await Users.findById(data.userId);
  await logEvent(
    "Group User Add",
    data?.IdFromToken,
    "user: " + user.name + " , email: " + user.email + " added",
    null
  );

  const group = await GroupRepository.findById(result.groupId);
  const groupUsers = await showUsers(data);
  const notificationMessage = `A member: ${user.name} has been added to the group: ${group.name}`;
  const notificationPromises = groupUsers?.result?.map(async (user) => {
    sendNotification(user.userId, notificationMessage);
  });
  await Promise.all(notificationPromises);
  return { message: "added successfully  " };
};
export default { create, show, addUser, showUsers };
