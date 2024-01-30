import { model, Schema } from "mongoose";

import { MailStatus } from "../utils/types.util";
import type { IMail } from "../interface";

const MailSchema = new Schema<IMail>(
  {
    email: {
      type: String,
      maxlength: 255,
      trim: true,
      lowercase: true
    },
    user: { type: Schema.Types.ObjectId, required: false, ref: "User" },
    subject: { type: String },
    template: { type: String },
    context: { type: Object, required: false },
    status: { type: String, enum: MailStatus, default: MailStatus.PENDING }
  },
  { timestamps: true }
);

export const Mail = model<IMail>("Mail", MailSchema);
