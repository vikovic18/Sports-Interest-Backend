import moment from "moment";

import type { IOtp, ICreateOtp } from "../interface";
import { OTPModel } from "../models";
import log from "../utils/logger.util";
import { generateCode } from "../utils/utils.utils";
import { createServiceError } from "utils/error.util";

const otpEnvLength = process.env.OTP_MAX_ATTEMPTS;
export const OTP_MAX_ATTEMPTS = parseInt(otpEnvLength !== undefined ? otpEnvLength : "5");
export const OTP_TTL = 15 * 60 * 1000;

export const create = async (data: ICreateOtp): Promise<IOtp> => {
  log.debug(`CreateOtp: ${data.email} creating otp`);
  const expires = moment().add(OTP_TTL, "milliseconds");

  const otp = new OTPModel({ ...data, expiresAt: expires });
  log.debug(`CreateOtp: ${data.email} generating code`);
  const code = generateCode();
  await otp.setCode(code);
  log.debug(`CreateOtp: ${data.email} code generated`);

  return await otp.save();
};

export const getUnused = async (token: string, { Otp = OTPModel } = {}) => {
  const error = createServiceError("", "OTP_NOT_FOUND_ERROR");
  const otp = await Otp.findOne({ token, isUsed: false }).orFail(error);
  return otp.toObject();
};

export const update = async (data: Record<string, unknown>, { Otp = OTPModel } = {}) => {
  const error = createServiceError("", "OTP_NOT_UPDATED_ERROR");
  const otp = await Otp.updateMany(data).lean().orFail(error);
  return otp;
};