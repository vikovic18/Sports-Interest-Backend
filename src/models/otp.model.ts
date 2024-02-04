import { model, Schema } from "mongoose";

import { OtpType } from "../utils/types.util";
import IOtpModel from "../interface/otp.interface";

import mergeWithBaseSchema from "./base";

let otpSchema = new Schema<IOtpModel>(
  {
    email: {
      type: String,
      maxlength: 255,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"]
    },
    userId: { type: Schema.Types.ObjectId, required: false },
    channel: { type: String, enum: OtpType },
    mailId: { type: Schema.Types.ObjectId },
    token: { type: String },
    failedAttempts: { type: Number, default: 0 },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date }
  }
);

otpSchema = mergeWithBaseSchema(otpSchema);

const OtpModel = model<IOtpModel>("Otp", otpSchema);

export default OtpModel;
