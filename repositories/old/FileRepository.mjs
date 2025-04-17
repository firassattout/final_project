import { Backups } from "../models/Backups.mjs";
import { Files } from "../models/Files.mjs";

export default new (class FileRepository {
  async findById(fileId) {
    return await Files.findById(fileId);
  }
  async find(fileId) {
    return await Files.find(fileId);
  }

  async findByGroup(groupId) {
    return await File.find({ group: groupId });
  }

  async findBackups(groupId) {
    return await Backups.find({ group: groupId });
  }

  async findByIdBackups(groupId) {
    return await Backups.findById(groupId);
  }

  async createFile(data) {
    const file = new Files(data);
    return await file.save();
  }

  async findByIdAndUpdate(id, data) {
    return await Files.findByIdAndUpdate(id, data);
  }

  async findByIdAndDelete(id) {
    return await Files.findByIdAndDelete(id);
  }
})();
