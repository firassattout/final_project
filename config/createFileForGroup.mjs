import { google } from "googleapis";

export async function createFolder(name, parents) {
  const KEYFILEPATH = "./googleFile.json";
  const SCOPES = ["https://www.googleapis.com/auth/drive"];

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const service = google.drive({ version: "v3", auth });
  const fileMetadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parents],
  };
  try {
    const file = await service.files.create({
      requestBody: fileMetadata,
      fields: "id",
    });

    return file.data.id;
  } catch (err) {
    console.log(err);

    throw err;
  }
}
