import { IJWTPayload } from "interface/jwt.interface";


export const generateVerificationUrl = (token: IJWTPayload): string => {
  return `${process.env.FRONTEND_URI}/verify-email?token=${token.token}`;
};