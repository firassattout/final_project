import stream from "stream";
import { google } from "googleapis";
import sharp from "sharp";

export const upload = async (file, path) => {
  const KEYFILEPATH = "./googleFile.json";
  const SCOPES = ["https://www.googleapis.com/auth/drive"];

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const compressedBuffer = await sharp(file.buffer)
    .resize(800)
    .jpeg({ quality: 70 })
    .toBuffer();

  const bufferStream = new stream.PassThrough();
  bufferStream.end(compressedBuffer);

  const { data } = await google.drive({ version: "v3", auth }).files.create({
    media: {
      mimeType: "image/jpeg",
      body: bufferStream,
    },
    requestBody: {
      name: file.originalname,
      parents: [path],
    },
    fields: "id,name",
  });

  return data;
};
