import "nodemailer-express-handlebars";

import getTransporter from "../config/mail.config";
import type { ISendMail } from "../interface/";
import { Mail } from "../models";
import log from "../utils/logger.util";
import { MailStatus } from "../utils/types.util";


export const SendMail = async (data: ISendMail): Promise<MailStatus> => {

  const transporter = await getTransporter();

  log.debug(`CreateMail: creating mail for ${data.email}`);
  const mail = new Mail(data);
  
  try {
    await transporter?.sendMail({
      from: process.env.SMTP_FROM,
      to: mail.email,
      subject: mail.subject,
      // @ts-expect-error-error
      context: mail.context,
      template: mail.template
    });
    return MailStatus.SENT;
  } catch (err) {
    if (err instanceof Error) {
      log.error("SendMail: " + err.message);
    }
    return MailStatus.FAILED;
  }
};