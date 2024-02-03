import { model, Schema } from "mongoose";
import * as bcrypt from "bcryptjs";

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
    mailId: { type: Schema.Types.ObjectId, ref: "Mail" },
    token: { type: String },
    failedAttempts: { type: Number, default: 0 },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date }
  }
);

otpSchema.method(
  "validateCode",
  async function (code: string): Promise<boolean> {
    this.isUsed = await bcrypt.compare(code, this.token);
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this.isUsed) this.failedAttempts++;
    return this.isUsed;
  }
);

otpSchema.method("setCode", async function (code: string): Promise<void> {
  this.token = await bcrypt.hash(code, 10);
});

otpSchema = mergeWithBaseSchema(otpSchema);

const OtpModel = model<IOtpModel>("Otp", otpSchema);

export default OtpModel;
