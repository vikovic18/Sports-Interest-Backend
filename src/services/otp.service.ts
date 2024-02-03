import moment from "moment";
import * as bcrypt from "bcryptjs";
import type { IOtpBase } from "../interface/otp.interface";
import OtpModel from "../models/otp.model";
import logger from "../utils/logger.util";
import { StringOrObjectId } from "interface/base";

const otpEnvLength = process.env.OTP_MAX_ATTEMPTS;
export const OTP_MAX_ATTEMPTS = parseInt(otpEnvLength !== undefined ? otpEnvLength : "5");
export const OTP_TTL = 15 * 60 * 1000;

export const create = async (data: IOtpBase, {Otp = OtpModel} = {}) => {
  logger.debug(`CreateOtp: ${data.email} creating otp`);
  const expires = moment().add(OTP_TTL, "milliseconds");
  const otp = await Otp.create({...data, expiresAt: expires});
  // const otp = new Otp({ ...data, expiresAt: expires });
  logger.debug(`CreateOtp: ${data.email} generating code`);
  // await otp.save();
  
  logger.debug(`CreateOtp: ${data.email} code generated`);

  return otp.toObject();
};

// export const validateToken = async (otpDocument: IOtpModel, code: string): Promise<boolean> => {
//   const isMatch = await bcrypt.compare(code, otpDocument.token);
//   if (!isMatch) {
//     await OtpModel.updateOne({ _id: otpDocument.id }, { $inc: { failedAttempts: 1 } });
//     // otpDocument.failedAttempts++;

//     // await otpDocument.save(); // Persist changes if validation fails
//   } else {
//     await OtpModel.updateOne({ _id: otpDocument.id }, { $set: { isUsed: true } });
//   }
//   return isMatch;
// };

export const setToken = async (otpId: StringOrObjectId, code: string, {Otp = OtpModel}= {}) => {
  const hashedCode = await bcrypt.hash(code, 10);
  const otp = await Otp.findByIdAndUpdate({_id: otpId}, {$set: {token: hashedCode}}, {new: true});
  return otp?.toObject();
};