import stream from "stream";
import { google } from "googleapis";

export const uploadFile = async (file, folder, numberOfEdit) => {
  const KEYFILEPATH = "./googleFile.json";
  const SCOPES = ["https://www.googleapis.com/auth/drive"];

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);
  const { data } = await google.drive({ version: "v3", auth }).files.create({
    media: {
      mimeType: file.mimeType,
      body: bufferStream,
    },
    requestBody: {
      name: numberOfEdit,
      parents: [folder],
    },
    fields: "id,name",
  });

  return data;
};
