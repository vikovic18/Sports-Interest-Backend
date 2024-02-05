import { StringOrObjectId } from "./base";

export interface IJWTPayloadBase {
    userId: StringOrObjectId;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: string;
    otp?: string;
  }

export interface IJWTPayload extends IJWTPayloadBase{
    otp?: string;
    accessToken: string;
    refreshToken: string;
  }