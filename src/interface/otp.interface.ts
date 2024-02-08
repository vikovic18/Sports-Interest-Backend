import IModelBase, { StringOrObjectId } from "./base";

export interface IOtpBase {
  userId?: StringOrObjectId
  mailId?: StringOrObjectId
  email: string
  token?: string
  channel: string
}

export interface IOtp extends IOtpBase {
  userId: StringOrObjectId
  mailId: StringOrObjectId
  isUsed: boolean | false
  expiresAt: Date
  token: string
  failedAttempts: number
}

interface IOtpModel extends IOtp, IModelBase {}

export default IOtpModel;
