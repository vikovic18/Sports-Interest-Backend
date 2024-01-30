import hbs from "nodemailer-express-handlebars";
import nodemailer from "nodemailer";
import path from "path";
import smtp from "nodemailer-smtp-transport";

const mailConfig = async (): Promise<nodemailer.Transporter> => {
  console.log("getMailTransporter: creating transporter");
  const transporter = nodemailer.createTransport(
    smtp({
      host: process.env.SMTP_HOST as string,
      port: parseInt(process.env.SMTP_PORT as string),
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string
      }
    })
  );

  console.log("getMailTransporter: verifying transporter");
  const conn = await transporter.verify();
  if (!conn) {
    console.error("Mail server is not ready");
    process.exit(1);
  }

  console.log("getMailTransporter: transporter created");
  console.log("getMailTransporter: setting up templates");
  const workDir = path.join(process.cwd(), "templates");
  const options = {
    viewEngine: {
      extname: ".hbs",
      layoutsDir: workDir + "/layouts",
      defaultLayout: "",
      partialsDir: workDir + "/partials"
    },
    viewPath: workDir,
    extName: ".hbs"
  };

  transporter.use("compile", hbs(options));
  console.log("Mail server is ready");

  return transporter;
};

export default mailConfig;


