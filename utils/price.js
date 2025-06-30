export const basePrices = {
  CPC: {
    banner: 1000,
    rewarded: 1000,
    // app_open: 300,
  },
  CPM: {
    banner: 10000,
    rewarded: 30000,
    // app_open: 7000,
  },
};

export const platformFactors = {
  web: 1.0,
  mobile: 1.2,
  // both: 1.1,
};

export const publisherBudget = (cost) => {
  return (cost * 40) / 100;
};
