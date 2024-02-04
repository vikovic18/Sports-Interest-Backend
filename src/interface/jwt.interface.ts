import { StringOrObjectId } from "./base";

export interface IJWTPayloadBase {
    userId: StringOrObjectId;
  }

export interface IJWTPayload extends IJWTPayloadBase{
    expiresIn?: string;
    otp?: string;
    accessToken?: string;
    refreshToken?: string;
  }