import jwt from "jsonwebtoken";
import { IJWTPayload } from "interface/jwt.interface";


export const generateJWT = (payload: IJWTPayload): IJWTPayload => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  const { expiresIn, ...accessTokenPayload } = payload;

  // Generate Access Token
  const accessToken = jwt.sign(
    accessTokenPayload,
    secret,
    { expiresIn: expiresIn || "1h" } 
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
    refreshToken
  };

  return jwtToken;
};