import sharp from "sharp";

export const AD_VALIDATIONS = {
  banner: {
    web: {
      width: { min: 720, max: 728 },
      height: { min: 80, max: 90 },
      maxSizeKB: 200,
    },
    mobile: {
      width: { min: 300, max: 320 },
      height: { min: 40, max: 50 },
      maxSizeKB: 150,
    },
  },
  rewarded: {
    web: {
      width: { min: 720, max: 1400 },
      height: { min: 500, max: 720 },
      maxSizeKB: 500,
    },
    mobile: {
      width: { min: 300, max: 320 },
      height: { min: 250, max: 300 },
      maxSizeKB: 200,
    },
  },
  app_open: {
    web: {
      width: { min: 720, max: 1260 },
      height: { min: 400, max: 600 },
      maxSizeKB: 300,
    },
    mobile: {
      width: { min: 300, max: 400 },
      height: { min: 600, max: 1000 },
      maxSizeKB: 300,
    },
  },
};

const VIDEO_VALIDATIONS = {
  rewarded: {
    web: {
      width: { min: 640, max: 1920 },
      height: { min: 360, max: 1080 },
      maxSizeMB: 10,
      duration: { min: 15, max: 30 }, // بالثواني
      allowedFormats: ["mp4", "webm"],
    },
    mobile: {
      width: { min: 320, max: 1080 },
      height: { min: 480, max: 1920 },
      maxSizeMB: 8,
      duration: { min: 10, max: 30 },
      allowedFormats: ["mp4", "mov"],
    },
  },
  app_open: {
    web: {
      width: { min: 720, max: 1920 },
      height: { min: 1280, max: 2160 },
      maxSizeMB: 15,
      duration: { min: 5, max: 15 },
      allowedFormats: ["mp4", "webm"],
    },
    mobile: {
      width: { min: 720, max: 1080 },
      height: { min: 1280, max: 1920 },
      maxSizeMB: 12,
      duration: { min: 5, max: 15 },
      allowedFormats: ["mp4", "mov"],
    },
  },
};

export async function validateImage(file, platform, adType) {
  const validation = AD_VALIDATIONS[adType][platform];
  if (!validation) {
    throw new Error(`Invalid platform or ad type: ${platform}, ${adType}`);
  }

  const image = sharp(file.buffer);
  const metadata = await image.metadata();

  if (
    metadata.width < validation.width.min ||
    metadata.width > validation.width.max ||
    metadata.height < validation.height.min ||
    metadata.height > validation.height.max
  ) {
    throw new Error(
      `Image dimensions must be within ${validation.width.min} - ${validation.width.max} x ${validation.height.min} - ${validation.height.max} for ${platform} ${adType}`
    );
  }

  const fileSizeKB = file.size / 1024;
  if (fileSizeKB > validation.maxSizeKB) {
    throw new Error(
      `Image size exceeds ${validation.maxSizeKB}KB for ${platform} ${adType}`
    );
  }

  return true;
}
