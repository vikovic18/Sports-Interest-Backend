import "nodemailer-express-handlebars";
import type { IMail } from "../interface/mail.interface";
import MailModel from "../models/mail.model";
import logger from "../utils/logger.util";
import { MailStatus } from "../utils/types.util";
import { createMailTransporter } from "../utils/mail.util"; // Ensure correct path

export const send = async (data: IMail): Promise<MailStatus> => {
  // Use the singleton transporter; it will either create or reuse the existing one
  const transporter = await createMailTransporter();

  logger.debug(`Creating mail for ${data.email}`);
  const mail = new MailModel(data);

  try {
    await mail.save();
    
    // Prepare email options
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: mail.email,
      subject: mail.subject,
      context: mail.context, 
      template: mail.template
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    await mail.updateOne({ status: MailStatus.MAIL_SENT });
    logger.info(`Mail sent successfully to ${data.email}`);
    return MailStatus.MAIL_SENT;
  } catch (err) {
    logger.error(`SendMail error for ${data.email}: ${err instanceof Error ? err.message : "Unknown error"}`);
    
    await mail.updateOne({ status: MailStatus.MAIL_FAILED });
    return MailStatus.MAIL_FAILED;
  }
};