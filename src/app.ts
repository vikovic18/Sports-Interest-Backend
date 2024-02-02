import express from "express";
import cors from "cors";
import morgan from "morgan";
import logger from "./utils/logger.util";
import router from "./routes";
import * as errorMiddleware from "./middlewares/error.middleware";
import session from "express-session";
import getSession from "config/session.config";

const app = express();


app.use(
  cors(),
  express.json({ limit: "10mb" }),
  express.urlencoded({ extended: true }),
  session(getSession),
  morgan("combined", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  })
);

app.use("/api", router);

app.use(errorMiddleware.handleNotFound);
app.use(errorMiddleware.handleError);

export default app;
