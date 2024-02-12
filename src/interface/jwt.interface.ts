import { StringOrObjectId } from "./base";

export interface IJWTPayloadBase {
    userId: StringOrObjectId;
    token?: string;
    expiresIn?: string;
    otp?: string;
  }

export interface IJWTPayload extends IJWTPayloadBase{
    otp?: string;
    token: string;
  }