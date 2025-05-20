import { AdDisplays } from "../models/AdDisplaysModel.mjs";

class displaysRepository {
  async create(adData) {
    const ad = new AdDisplays(adData);
    return ad.save();
  }

  async findById(id) {
    return await AdDisplays.findById(id);
  }
  async findOne(data) {
    return await AdDisplays.findOne(data);
  }

  async edit(id, adData) {
    return await AdDisplays.findByIdAndUpdate(
      id,
      {
        $set: adData,
      },
      {
        new: true,
      }
    );
  }
  async inc(id, adData) {
    return await AdDisplays.findByIdAndUpdate(
      id,
      {
        $inc: adData,
      },
      {
        new: true,
      }
    );
  }
}

export default new displaysRepository();
