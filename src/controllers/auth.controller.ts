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
    accessSecret = jwtutil.JWT_ACCESS_SECRET,
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
          expiresIn: "2hr",
        }, accessSecret);


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
    generateAccessToken = jwtutil.generateJWT,
    generateRefreshToken = jwtutil.generateJWT,
    accessSecret = jwtutil.JWT_ACCESS_SECRET,
    refreshSecret = jwtutil.JWT_REFRESH_SECRET,
    saveRefreshToken = refreshTokenService.create,
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token } = req.body;

        const { userId, otp } = verifyJWTToken(token, accessSecret);
        const verifiedOtp = await getOtp({
          userId,
          isUsed: false,
          channel: OtpType.AUTH_REGISTER,
        });
        await ensureOtpTokenMatches(otp ?? "", verifiedOtp.token);

        const user = await getUser(verifiedOtp.userId);

        // Mark email as verified
        await updateUser(user.id, { isEmailVerified: true });

        // Mark OTP as used
        await updateOtp(verifiedOtp.id, { isUsed: true });

        const accessToken = generateAccessToken({
          userId: user.id,
          expiresIn: "3d"
        }, accessSecret);

        const refreshToken = generateRefreshToken({
          userId: user.id,
          expiresIn: "30d"
        }, refreshSecret);

        await saveRefreshToken({
          userId: user.id,
          token: refreshToken.token,
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
              accessToken: accessToken.token,
              refreshToken: refreshToken.token,
            },
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
    generateAccessToken = jwtutil.generateJWT,
    generateRefreshToken = jwtutil.generateJWT,
    saveRefreshToken = refreshTokenService.create,
    accessSecret = jwtutil.JWT_ACCESS_SECRET,
    refreshSecret = jwtutil.JWT_REFRESH_SECRET
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password: passwordIn } = req.body;
        const user = await getUser(email);

        await ensurePasswordMatches(passwordIn, user.password);

        verifyEmail(user);

        const accessToken = generateAccessToken({
          userId: user.id,
          expiresIn: "3d"
        }, accessSecret);

        const refreshToken = generateRefreshToken({
          userId: user.id,
          expiresIn: "30d"
        }, refreshSecret);

        await saveRefreshToken({
          userId: user.id,
          token: refreshToken.token,
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
              accessToken: accessToken.token,
              refreshToken: refreshToken.token,
            },
          },
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          EMAIL_NOT_FOUND_ERROR: StatusCodes.UNAUTHORIZED,
          HASH_MISMATCH_ERROR: StatusCodes.UNAUTHORIZED,
          EMAIL_NOT_VERIFIED_ERROR: StatusCodes.UNAUTHORIZED,
        };
        const errorCode = "EMAIL_NOT_FOUND_ERROR";
        const errorMessage = (error as Error).message || "Unable to login user";

        const statusCode =
        errorCode in errMap
          ? errMap[errorCode]
          : StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };

export const handleGetAccessToken =
  ({
    getRefreshToken = refreshTokenService.get,
    verifyToken = jwtutil.verifyJWT,
    generateToken = jwtutil.generateJWT,
    accessSecret = jwtutil.JWT_ACCESS_SECRET,
    refreshSecret = jwtutil.JWT_REFRESH_SECRET
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { refreshToken } = req.body;

        const storedToken = await getRefreshToken({
          userId: req.user.id,
          token: refreshToken,
        });

        verifyToken(storedToken.token, refreshSecret);
        const accessToken = generateToken({
          userId: storedToken.userId,
          expiresIn: "3d"
        }, accessSecret);
        res.json({
          status: true,
          message: "Access token generated successfully",
          data: {
            token: {
              accessToken: accessToken.token,
              refreshToken: storedToken.token,
            },
          },
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          REFRESH_TOKEN_NOT_FOUND_ERROR: StatusCodes.UNAUTHORIZED,
          TOKEN_EXPIRED_OR_INVALID_ERROR: StatusCodes.UNAUTHORIZED,
        };
        const errorCode = "REFRESH_TOKEN_NOT_FOUND_ERROR";
        const errorMessage =
        (error as Error).message || "Unable to generate access token";

        const statusCode =
        errorCode in errMap
          ? errMap[errorCode]
          : StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };
export const handleResendVerificationEmail =
  ({
    getUser = userService.getByEmail,
    verifiedEmail = userService.verifiedEmail,
    sendVerificationEmail = mailService.send,
    createOtp = otpService.create,
    generateToken = generateCode,
    setToken = otpService.setToken,
    generateJWTToken = jwtutil.generateJWT,
    getVerificationEmailUrl = authUtil.generateVerificationUrl,
    accessSecret = jwtutil.JWT_ACCESS_SECRET
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.body;
        const user = await getUser(email);

        verifiedEmail(user);

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
          expiresIn: "2hr",
        }, accessSecret);

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
          status: StatusCodes.OK,
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
          EMAIL_VERIFIED_ERROR: StatusCodes.CONFLICT,
        };
        const errorCode = "EMAIL_VERIFIED_ERROR";
        const errorMessage =
        (error as Error).message || "Unable to send verfication email";

        const statusCode = errMap[errorCode] || StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };

export const handleForgotPassword =
  ({
    getUser = userService.getByEmail,
    sendVerificationEmail = mailService.send,
    createOtp = otpService.create,
    generateToken = generateCode,
    setToken = otpService.setToken,
    generateJWTToken = jwtutil.generateJWT,
    getVerificationEmailUrl = authUtil.generateVerificationUrl,
    accessSecret = jwtutil.JWT_ACCESS_SECRET
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.body;
        const user = await getUser(email);

        const otp = await createOtp({
          email: user.email,
          userId: user.id,
          channel: OtpType.AUTH_RESET,
        });

        const code = generateToken();

        await setToken(otp.id, code);

        const token = generateJWTToken({
          userId: user.id,
          otp: code,
          expiresIn: "1hr"
        }, accessSecret);

        const verificationEmailUrl = getVerificationEmailUrl(token);

        await sendVerificationEmail({
          userId: user.id,
          email: user.email,
          subject: "Reset your password",
          context: {
            firstName: user.firstName,
            verificationEmailUrl,
          },
          template: "reset-password",
        });

        res.json({
          status: StatusCodes.OK,
          message:
          "Please check your email for a verification link to reset your password",
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          EMAIL_NOT_FOUND_ERROR: StatusCodes.CONFLICT,
        };
        const errorCode = "EMAIL_NOT_FOUND_ERROR";
        const errorMessage =
        (error as Error).message || "Unable to reset password";

        const statusCode = errMap[errorCode] || StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };

export const handleVerifyForgotPassword =
  ({
    verifyJWTToken = jwtutil.verifyJWT,
    ensureOtpTokenMatches = hashUtil.compare,
    getOtp = otpService.get,
    updateOtp = otpService.update,
    generateTempToken = jwtutil.generateJWT,
    accessSecret = jwtutil.JWT_ACCESS_SECRET
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token } = req.body;

        const { userId, otp } = verifyJWTToken(token, accessSecret);
        const verifiedOtp = await getOtp({
          userId,
          isUsed: false,
          channel: OtpType.AUTH_RESET,
        });
        await ensureOtpTokenMatches(otp ?? "", verifiedOtp.token);

        // Mark OTP as used
        await updateOtp(verifiedOtp.id, { isUsed: true });

        const tempToken = generateTempToken({
          userId,
          expiresIn: "5m",
        }, accessSecret);

        res.json({
          status: StatusCodes.OK,
          message: "Proceed to reset password",
          data: {
            tempToken: tempToken.token,
          },
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          OTP_NOT_FOUND_ERROR: StatusCodes.BAD_REQUEST,
          INVALID_TOKEN_ERROR: StatusCodes.BAD_REQUEST,
        };
        const errorCode = "OTP_NOT_FOUND_ERROR";
        const errorMessage =
        (error as Error).message || "Unable to reset password";

        const statusCode =
        errorCode in errMap
          ? errMap[errorCode]
          : StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };

export const handleResetPassword =
  ({
    verifyJWTToken = jwtutil.verifyJWT,
    hashPassword = hashUtil.hash,
    updateUserPassword = userService.update,
    accessSecret = jwtutil.JWT_ACCESS_SECRET
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { password } = req.body;
        const authHeader = req.headers["authorization"];
        const token = authHeader?.split(" ")[1]; // "Bearer TOKEN"
        const { userId } = verifyJWTToken(token ?? "", accessSecret);

        await updateUserPassword(userId, {
          password: await hashPassword(password),
        });

        res.json({
          status: StatusCodes.OK,
          message: "Password reset successfully",
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          TOKEN_EXPIRED_OR_INVALID_ERROR: StatusCodes.UNAUTHORIZED,
          JWT_SECRET_NOT_DEFINED_ERROR: StatusCodes.UNAUTHORIZED,
          INVALID_TOKEN_ERROR: StatusCodes.UNAUTHORIZED,
        };
        const errorCode = "TOKEN_EXPIRED_OR_INVALID_ERROR";
        const errorMessage =
        (error as Error).message || "Unable to reset password.";

        const statusCode =
        errorCode in errMap
          ? errMap[errorCode]
          : StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };

export const handleLogout =
  ({
    deleteRefreshTokensForUser = refreshTokenService.deleteToken,
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user.id;

        await deleteRefreshTokensForUser(userId);

        res.json({
          status: true,
          message: "Logged out successfully",
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          REFRESH_TOKEN_NOT_FOUND_ERROR: StatusCodes.UNAUTHORIZED
        };
        const errorCode = "REFRESH_TOKENS_NOT_FOUND_ERROR";
        const errorMessage =
        (error as Error).message || "Unable to logout.";

        const statusCode =
        errorCode in errMap
          ? errMap[errorCode]
          : StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };
