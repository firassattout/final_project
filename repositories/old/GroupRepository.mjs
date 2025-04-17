import { Groups } from "../models/Groups.mjs";
import { GroupUser } from "../models/GroupUser.mjs";

export default new (class GroupRepository {
  async findById(groupId) {
    return await Groups.findById(groupId);
  }

  async findOne(data) {
    return await Groups.findOne(data);
  }

  async GroupUserFind(data) {
    return await GroupUser.find(data);
  }

  async GroupUserFindOne(data) {
    return await GroupUser.findOne(data);
  }

  async findByGroup(groupId) {
    return await Groups.find({ group: groupId });
  }

  async createGroups(data) {
    const group = new Groups(data);
    return await group.save();
  }

  async newGroupUser(data) {
    const group = new GroupUser(data);
    return await group.save();
  }
})();
