import Ad from "../models/AdModel.mjs";

class AdRepository {
  async create(adData) {
    const ad = new Ad(adData);
    return ad.save();
  }

  async findById(id) {
    return Ad.findById(id);
  }

  async findAll() {
    return Ad.find({ isActive: true });
  }

  async update(id, adData) {
    return Ad.findByIdAndUpdate(id, adData, { new: true });
  }

  async delete(id) {
    return Ad.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async incrementClicks(id) {
    return Ad.findByIdAndUpdate(id, { $inc: { clicks: 1 } }, { new: true });
  }

  async incrementImpressions(id) {
    return Ad.findByIdAndUpdate(
      id,
      { $inc: { impressions: 1 } },
      { new: true }
    );
  }
}

export default AdRepository;
