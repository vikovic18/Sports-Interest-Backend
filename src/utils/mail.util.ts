import nodemailer, { Transporter } from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import smtp from "nodemailer-smtp-transport";
import logger from "../utils/logger.util";

let transporterSingleton: Transporter | null = null;

const createMailTransporter = async () => {
  if (transporterSingleton) {
    logger.info("Using existing mail transporter");
    return transporterSingleton;
  }

  try {
    logger.info("Creating new mail transporter");
    const transporter = nodemailer.createTransport(
      smtp({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT as string),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    );

    await transporter.verify();
    logger.info("Transporter verified and ready");

    const workDir = path.join(process.cwd(), "templates");
    transporter.use("compile", hbs({
      viewEngine: {
        extname: ".hbs",
        layoutsDir: path.join(workDir, "layouts"),
        defaultLayout: "",
        partialsDir: path.join(workDir, "partials"),
      },
      viewPath: workDir,
      extName: ".hbs",
    }));

    transporterSingleton = transporter;
    return transporterSingleton;
  } catch (error) {
    logger.error(`Error setting up transporter: ${(error as Error).message}`);
    throw error;
  }
};

export { createMailTransporter };