export const basePrices = {
  CPC: {
    banner: 1000,
    rewarded: 1000,
  },
  CPM: {
    banner: 10000,
    rewarded: 30000,
  },
};

export const platformFactors = {
  web: 1.0,
  mobile: 1.2,
};

export const publisherBudget = (cost) => {
  return (cost * 40) / 100;
};
