import jwt from "jsonwebtoken";
import { IJWTPayload, IJWTPayloadBase } from "interface/jwt.interface";
import { createServiceError } from "./error.util";

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;


export const generateJWT = (payload: IJWTPayloadBase, secret: string): IJWTPayload => {
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  const { expiresIn, ...tokenPayload } = payload;

  // Generate Token
  const token = jwt.sign(
    tokenPayload,
    secret,
    { expiresIn: expiresIn } 
  );

  

  const jwtToken = {
    ...tokenPayload,
    token,
    expiresIn
  };

  return jwtToken;
};

export const verifyJWT = (token: string, secret: string) => {
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