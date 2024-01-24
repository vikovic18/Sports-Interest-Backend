import express from "express";
import morgan from "morgan";
import logger from "./utils/logger.util";
import router from "./routes";

const app = express();

app.use(
  express.json({ limit: "10mb" }),
  express.urlencoded({ extended: true }),
  morgan("combined", {
    stream: {
      write: (message) => {
        logger.http(message.trim());
      },
    },
  }),
);

app.use("/api", router);

export default app;
