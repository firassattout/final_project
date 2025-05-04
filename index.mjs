import express from "express";

import connectDb from "./config/conectDb.mjs";
import { configDotenv } from "dotenv";
import { notfound, errorHandler } from "./middleware/errorMiddleware.mjs";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./utils/logger.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { adRoutes } from "./routes/adRoutes.mjs";
import { auth } from "./routes/authRoutes.mjs";
import { i18nMiddleware } from "./config/i18n.mjs";

const app = express();
configDotenv();
connectDb();
const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(i18nMiddleware);
app.use(express.json());
app.use(helmet());
// app.use(
//   morgan("combined", {
//     stream: { write: (message) => logger.info(message.trim()) },
//   })
// );
app.use(cors());

app.use("/api/", adRoutes);
app.use("/api/", auth);

app.use(notfound);
app.use(errorHandler);

app.listen(8000, () => {
  console.log("server is running");
});
