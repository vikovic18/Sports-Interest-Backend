import { model, Schema } from "mongoose";

import { MailStatus } from "../utils/types.util";
import IMailModel from "../interface/mail.interface";
import mergeWithBaseSchema from "./base";

let mailSchema = new Schema<IMailModel>(
  {
    email: {
      type: String,
      maxlength: 255,
      trim: true,
      required: [true, "Email is required"],
      lowercase: true
    },
    userId: { type: Schema.Types.ObjectId, required: false},
    subject: { type: String, default: "" },
    template: { type: String, default: "" },
    context: { type: Object, required: false },
    status: { type: String, enum: MailStatus, default: MailStatus.MAIL_PENDING }
  }
);

mailSchema = mergeWithBaseSchema(mailSchema);

const MailModel = model<IMailModel>("Mail", mailSchema);

export default MailModel;
