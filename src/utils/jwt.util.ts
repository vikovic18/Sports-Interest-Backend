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

export const verifyJWT = (token: string) => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw createServiceError("JWT secret is not defined", "JWT_SECRET_NOT_DEFINED_ERROR");
  }

  try {
    const payload = jwt.verify(token, secret) as IJWTPayload;
    return payload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle specific JWT errors, e.g., 'invalid signature'
      if (error.message === "invalid signature") {
        throw createServiceError("Invalid token", "INVALID_TOKEN_ERROR");
      } else {
        throw createServiceError("Token expired or invalid", "TOKEN_EXPIRED_OR_INVALID_ERROR");
      }
    } else {
      // Handle other errors
      throw createServiceError("An unknown error occurred", "UNKNOWN_ERROR");
    }
  }
};