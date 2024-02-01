import type { Document, Types } from "mongoose";

import type { OtpType } from "../utils/types.util";

export interface IOtp extends Document {
  user: Types.ObjectId
  mail: Types.ObjectId
  email: string
  token: string
  channel: string
  isUsed: boolean | false
  expiresAt: Date
  failedAttempts: number
  setCode: (code: string) => Promise<void>
  validateCode: (code: string) => Promise<boolean>
}

export interface ICreateOtp {
  email: string
  user?: Types.ObjectId
  channel: OtpType
}