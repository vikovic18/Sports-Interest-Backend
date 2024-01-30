import moment from "moment";

import type { IOtp, ICreateOtp } from "../interface";
import { OTP } from "../models";
import log from "../utils/logger.util";
import { generateCode } from "../utils/utils.utils";

const otpEnvLength = process.env.OTP_MAX_ATTEMPTS;
export const OTP_MAX_ATTEMPTS = parseInt(otpEnvLength !== undefined ? otpEnvLength : "5");
export const OTP_TTL = 15 * 60 * 1000;

export const CreateOTP = async (data: ICreateOtp): Promise<IOtp> => {
  log.debug(`CreateOtp: ${data.email} creating otp`);
  const expires = moment().add(OTP_TTL, "milliseconds");

  const otp = new OTP({ ...data, expiresAt: expires });
  log.debug(`CreateOtp: ${data.email} generating code`);
  const code = generateCode();
  await otp.setCode(code);
  log.debug(`CreateOtp: ${data.email} code generated`);

  return await otp.save();
};