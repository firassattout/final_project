import { Ads } from "../models/AdModel.mjs";

class AdRepository {
  async create(adData) {
    const ad = new Ads(adData);
    return ad.save();
  }

  async findById(id) {
    return await Ads.findById(id);
  }
  async findByUser(id) {
    return await Ads.find({ userId: id });
  }

  async edit(id, adData) {
    return await Ads.findByIdAndUpdate(
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

export default new AdRepository();
