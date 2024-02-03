import moment from "moment";

import type { IOtp, ICreateOtp } from "../interface/otp.interface";
import OtpModel from "../models/otp.model";
import logger from "../utils/logger.util";
import { generateCode } from "../utils/utils.utils";
import { createServiceError } from "utils/error.util";

const otpEnvLength = process.env.OTP_MAX_ATTEMPTS;
export const OTP_MAX_ATTEMPTS = parseInt(otpEnvLength !== undefined ? otpEnvLength : "5");
export const OTP_TTL = 15 * 60 * 1000;

export const create = async (data: ICreateOtp): Promise<IOtp> => {
  logger.debug(`CreateOtp: ${data.email} creating otp`);
  const expires = moment().add(OTP_TTL, "milliseconds");
  const otp = new OtpModel({ ...data, expiresAt: expires });
  logger.debug(`CreateOtp: ${data.email} generating code`);
  const code = generateCode();
  await otp.setCode(code);
  await otp.save();
  logger.debug(`CreateOtp: ${data.email} code generated`);

  return await otp.toObject();
};

export const getUnused = async (token: string, { Otp = OtpModel } = {}) => {
  const error = createServiceError("", "OTP_NOT_FOUND_ERROR");
  const otp = await Otp.findOne({ token, isUsed: false }).orFail(error);
  return otp.toObject();
};

export const update = async (data: Record<string, unknown>, { Otp = OtpModel } = {}) => {
  const error = createServiceError("", "OTP_NOT_UPDATED_ERROR");
  await Otp.updateMany(data).lean().orFail(error);
};