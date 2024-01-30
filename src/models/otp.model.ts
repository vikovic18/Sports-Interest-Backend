import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

import { OtpType } from "../utils/types.util";
import type { IOtp } from "../interface";

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      maxlength: 255,
      trim: true,
      lowercase: true
    },
    user: { type: Schema.Types.ObjectId, required: false, ref: "User" },
    channel: { type: String, enum: OtpType },
    mail: { type: Schema.Types.ObjectId, ref: "Mail" },
    token: { type: String },
    failedAttempts: { type: Number, default: 0 },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

OtpSchema.method(
  "validateCode",
  async function (code: string): Promise<boolean> {
    this.isUsed = await bcrypt.compare(code, this.token);
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this.isUsed) this.failedAttempts++;
    return this.isUsed;
  }
);

OtpSchema.method("setCode", async function (code: string): Promise<void> {
  this.token = await bcrypt.hash(code, 10);
});

export const OTP = model<IOtp>("Otp", OtpSchema);
