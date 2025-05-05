import { AdMedia } from "../models/AdMediaModel.mjs";

class MediaRepository {
  async create(adData) {
    const ad = new AdMedia(adData);
    return ad.save();
  }

  async findById(id) {
    return await AdMedia.findById(id);
  }

  async edit(id, adData) {
    return await AdMedia.findByIdAndUpdate(
      id,
      {
        $set: adData,
      },
      {
        new: true,
      }
    );
  }
}

export default new MediaRepository();
