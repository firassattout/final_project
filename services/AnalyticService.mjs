import AnalyticRepository from "../repositories/AnalyticRepository.mjs";

class AnalyticService {
  async advertiserAnalytics(data) {
    const advertiserId = data.body.userIdFromToken;
    const endDate = new Date(); // التاريخ الحالي
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 9);

    const stats = await AnalyticRepository.getAdvertiserStats(
      advertiserId,
      startDate,
      endDate
    );

    const dateRange = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateRange.push(new Date(d));
    }

    const formattedStats = dateRange.map((date) => {
      const stat = stats.find(
        (s) => s._id === date.toISOString().split("T")[0]
      );
      return {
        date: date.toISOString().split("T")[0],
        views: stat?.totalViews || 0,
        clicks: stat?.totalClicks || 0,
      };
    });

    return formattedStats.sort((a, b) => b.date.localeCompare(a.date));
  }

  async publisherAnalytics(data) {
    const publisherId = data.body.userIdFromToken;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 9);

    const stats = await AnalyticRepository.getPublisherStats(
      publisherId,
      startDate,
      endDate
    );

    const dateRange = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateRange.push(new Date(d));
    }

    const formattedStats = dateRange.map((date) => {
      const stat = stats.find(
        (s) => s._id === date.toISOString().split("T")[0]
      );
      return {
        date: date.toISOString().split("T")[0],
        views: stat?.totalViews || 0,
        clicks: stat?.totalClicks || 0,
      };
    });

    return formattedStats.sort((a, b) => b.date.localeCompare(a.date));
  }

  async adminAnalytics() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 9);

    const stats = await AnalyticRepository.getAdminStats(startDate, endDate);

    const dateRange = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateRange.push(new Date(d));
    }

    const formattedStats = dateRange.map((date) => {
      const stat = stats.find(
        (s) => s._id === date.toISOString().split("T")[0]
      );
      return {
        date: date.toISOString().split("T")[0],
        views: stat?.totalViews || 0,
        clicks: stat?.totalClicks || 0,
      };
    });

    return formattedStats.sort((a, b) => b.date.localeCompare(a.date));
  }
}

export default new AnalyticService();
