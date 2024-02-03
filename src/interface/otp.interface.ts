import type { Types } from "mongoose";

import type { OtpType } from "../utils/types.util";

import IModelBase from "./base";

export interface IOtpBase {
  userId: Types.ObjectId
  mailId: Types.ObjectId
  email: string
  token: string
  channel: string
  isUsed: boolean | false
  expiresAt: Date
  failedAttempts: number
}

export interface IOtp extends IOtpBase {
  setCode: (code: string) => Promise<void>
  validateCode: (code: string) => Promise<boolean>
}

interface IOtpModel extends IOtp, IModelBase {}

export default IOtpModel;

export interface ICreateOtp {
  email: string
  user?: Types.ObjectId
  channel: OtpType
}