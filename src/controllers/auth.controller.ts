import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createRequestError } from "../utils/error.util";
import * as userService from "../services/user.service";
import * as otpService from "../services/otp.service";
import * as hashUtil from "../utils/hash.util";
import * as jwtutil from "../utils/jwt.util";
import * as authUtil from "../utils/auth.util";
import * as mailService from "../services/mail.service";
import * as refreshTokenService from "../services/refresh.token.service";
import { OtpType } from "utils/types.util";
import { generateCode } from "utils/utils.utils";

export const handleRegisterUser =
  ({
    createUser = userService.create,
    hashPassword = hashUtil.hash,
    createOtp = otpService.create,
    sendVerificationEmail = mailService.send,
    generateToken = generateCode,
    setToken = otpService.setToken,
    generateJWTToken = jwtutil.generateJWT,
    getVerificationEmailUrl = authUtil.generateVerificationUrl,
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, firstName, lastName, password } = req.body;
        const user = await createUser({
          email,
          firstName,
          lastName,
          password: await hashPassword(password),
        });

        // todo: send user verification mail

        const otp = await createOtp({
          email: user.email,
          userId: user.id,
          channel: OtpType.AUTH_REGISTER,
        });

        const code = generateToken();

        await setToken(otp.id, code);

        const token = generateJWTToken({
          userId: user.id,
          otp: code,
          expiresIn: "2hr"
        });

        const verificationEmailUrl = getVerificationEmailUrl(token);

        await sendVerificationEmail({
          userId: user.id,
          email: user.email,
          subject: "Verify Your Email",
          context: {
            firstName: user.firstName,
            verificationEmailUrl,
          },
          template: "verify-email",
        });

        res.json({
          status: StatusCodes.CREATED,
          message: "Please check your email for a verification link",
          data: {
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              createdAt: user.createdAt,
            },
          },
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          DUPLICATE_EMAIL_ERROR: StatusCodes.CONFLICT,
        };
        const errorCode = "DUPLICATE_EMAIL_ERROR";
        const errorMessage =
        (error as Error).message || "Unable to register user";

        const statusCode =
        errorCode in errMap
          ? errMap[errorCode]
          : StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };

export const handleVerifyEmailOnRegistration =
  ({
    verifyJWTToken = jwtutil.verifyJWT,
    ensureOtpTokenMatches = hashUtil.compare,
    getOtp = otpService.get,
    getUser = userService.getById,
    updateOtp = otpService.update,
    updateUser = userService.update,
    generateJWTToken = jwtutil.generateJWT,
    saveRefreshToken = refreshTokenService.create
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token } = req.body;

        const { userId, otp } = verifyJWTToken(token);
        const verifiedOtp = await getOtp({
          userId,
          isUsed: false,
        });
        await ensureOtpTokenMatches(otp ?? "", verifiedOtp.token);

        const user = await getUser(verifiedOtp.userId);

        // Mark email as verified
        await updateUser(user.id, { isEmailVerified: true });

        // Mark OTP as used
        await updateOtp(verifiedOtp.id, { isUsed: true });

        const jwtToken = generateJWTToken({
          userId: user.id,
        });

        await saveRefreshToken({
          userId: user.id,
          token: jwtToken.refreshToken
        });

        res.json({
          status: StatusCodes.OK,
          message: "Registration successful",
          data: {
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              createdAt: user.createdAt,
            },
            token: {
              accessToken: jwtToken.accessToken,
              refreshToken: jwtToken.refreshToken
            }
          },
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          OTP_NOT_FOUND_ERROR: StatusCodes.BAD_REQUEST,
          USER_NOT_FOUND_ERROR: StatusCodes.BAD_REQUEST,
          INVALID_TOKEN_ERROR: StatusCodes.BAD_REQUEST,
        };
        const errorCode = "OTP_NOT_FOUND_ERROR";
        const errorMessage = (error as Error).message || "Unable to verify user";

        const statusCode =
        errorCode in errMap
          ? errMap[errorCode]
          : StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };

export const handleLoginUser =
  ({
    getUser = userService.getByEmail,
    ensurePasswordMatches = hashUtil.compare,
    verifyEmail = userService.verifyEmail,
    generateJWTToken = jwtutil.generateJWT,
    saveRefreshToken = refreshTokenService.create
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password: passwordIn } = req.body;
        const user = await getUser(email);

        await ensurePasswordMatches(passwordIn, user.password);

        verifyEmail(user);

        const jwtToken = generateJWTToken({
          userId: user.id,
        });

        await saveRefreshToken({
          userId: user.id,
          token: jwtToken.refreshToken
        });


        // todo: use favoured auth strategy

        res.json({
          status: true,
          message: "User logged in successfully",
          data: {
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              createdAt: user.createdAt,
            },
            token: {
              accessToken: jwtToken.accessToken,
              refreshToken: jwtToken.refreshToken
            }
          },
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          EMAIL_NOT_FOUND_ERROR: StatusCodes.UNAUTHORIZED,
          HASH_MISMATCH_ERROR: StatusCodes.UNAUTHORIZED,
          EMAIL_NOT_VERIFIED_ERROR: StatusCodes.UNAUTHORIZED
        };
        const errorCode = "EMAIL_NOT_FOUND_ERROR";
        const errorMessage =
        (error as Error).message || "Unable to login user";

        const statusCode =
        errorCode in errMap
          ? errMap[errorCode]
          : StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };
