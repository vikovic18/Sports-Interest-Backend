import jwt from "jsonwebtoken";
import { IJWTPayload, IJWTPayloadBase } from "interface/jwt.interface";
import { createServiceError } from "./error.util";


export const generateJWT = (payload: IJWTPayloadBase): IJWTPayload => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  const { expiresIn, ...accessTokenPayload } = payload;

  // Generate Access Token
  const accessToken = jwt.sign(
    accessTokenPayload,
    secret,
    { expiresIn: expiresIn || "3d" } 
  );

  // Generate Refresh Token
  const refreshToken = jwt.sign(
    accessTokenPayload,
    secret,
    { expiresIn: "30d" } 
  );

  const jwtToken = {
    ...accessTokenPayload,
    accessToken,
    refreshToken,
    expiresIn
  };

  return jwtToken;
};

export const verifyJWT = (token: string): IJWTPayload => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }



  // Generate Refresh Token
  const payload = jwt.verify(
    token,
    secret
  ) as unknown as IJWTPayload;

  if (!payload) throw createServiceError("", "TOKEN_EXPIRED_OR_INVALID_ERROR");
  return payload;
};