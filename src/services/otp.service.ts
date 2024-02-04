import moment from "moment";
import type { IOtpBase } from "../interface/otp.interface";
import OtpModel from "../models/otp.model";
import logger from "../utils/logger.util";
import { StringOrObjectId } from "interface/base";
import { hash } from "utils/hash.util";

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


export const setToken = async (otpId: StringOrObjectId, code: string, {Otp = OtpModel}= {}) => {
  const hashedCode = await hash(code);
  const otp = await Otp.findByIdAndUpdate({_id: otpId}, {$set: {token: hashedCode}}, {new: true});
  return otp?.toObject();
};