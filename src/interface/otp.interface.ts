import type { Types } from "mongoose";


import IModelBase from "./base";

export interface IOtpBase {
  userId?: Types.ObjectId
  mailId?: Types.ObjectId
  email: string
  token?: string
  channel: string
}

export interface IOtp extends IOtpBase {
  userId: Types.ObjectId
  mailId: Types.ObjectId
  isUsed: boolean | false
  expiresAt: Date
  failedAttempts: number
}

interface IOtpModel extends IOtp, IModelBase {}

export default IOtpModel;