import express from "express";
import morgan from "morgan";
import logger from "./utils/logger.util";
import router from "./routes";
import errorHandlerMiddleware from "utils/error.util";


const app = express();

app.use(
  express.json({ limit: "10mb" }),
  express.urlencoded({ extended: true }),
  morgan("combined", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }),
);

app.use("/api", router);

app.use(errorHandlerMiddleware);


export default app;
