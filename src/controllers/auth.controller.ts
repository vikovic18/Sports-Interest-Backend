import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createRequestError } from "../utils/error.util";
import * as userService from "../services/user.service";
import * as otpService from "../services/otp.service";
import * as hashUtil from "../utils/hash.util";
import * as jwtutil from "../utils/jwt.util";
import * as mailService from "../services/mail.service";
import { OtpType } from "utils/types.util";
<<<<<<< HEAD
import { Types } from "mongoose";
=======
import { generateCode } from "utils/utils.utils";
>>>>>>> 71ec99f068a0b7412912fa8dd64ea444089e8865

export const handleRegisterUser =
  ({
    createUser = userService.create,
    hashPassword = hashUtil.hash,
    createOtp = otpService.create,
    sendVerificationEmail = mailService.send,
    generateToken = generateCode,
    setToken = otpService.setToken,
    generateJWTToken = jwtutil.generateJWT
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
          channel: OtpType.AUTH_REGISTER
        });

        const code = generateToken();

        await setToken(otp.id, code);

        const token = generateJWTToken({
          userId: user.id,
          otp: code
        });

        const verificationUrl = `${process.env.FRONTEND_ENV}/verify-email?token=${token.accessToken}`;

        await sendVerificationEmail({
          userId: user.id,
          email: user.email,
          subject: "Verify Your Email",
          context: {
            firstName: user.firstName,
            verificationUrl,
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

        const statusCode = errorCode in errMap ? errMap[errorCode] : StatusCodes.INTERNAL_SERVER_ERROR;

        next(createRequestError(errorMessage, (error as Error).name, statusCode));
      }
    };

export const handleVerifyEmailOnRegistration =
    ({
      getOtp = otpService.getUnused,
      getUser = userService.getByEmail,
      updateUser = userService.update,
      updateOtp = otpService.update
    } = {}) =>
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { token } = req.body;
          // const { email, firstName, lastName, password } = req.body;
          if (!token || typeof token !== "string") {
            return next(createRequestError("Invalid verification token", "INVALID_TOKEN_ERROR", StatusCodes.BAD_REQUEST));
          }
         
  
          const otp = await getOtp(token);
  
          const user = await getUser(otp.email);

          // Mark email as verified
          await updateUser({isEmailVerified: true});

          // Mark OTP as used
          await updateOtp({isUsed: true});

          req.session.user = {
            id: user._id as unknown as Types.ObjectId
          };
  
          res.json({
            status: StatusCodes.OK,
            message: "Registration successful",
            data: {
              user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
              },
            },
          });
        } catch (error) {
          const errMap: Record<string, StatusCodes> = {
            OTP_NOT_FOUND_ERROR: StatusCodes.BAD_REQUEST,
            USER_NOT_FOUND_ERROR: StatusCodes.BAD_REQUEST,
            INVALID_TOKEN_ERROR: StatusCodes.BAD_REQUEST
          };
          const errorCode = "OTP_NOT_FOUND_ERROR";
          const errorMessage =
          (error as Error).message || "Unable to verify user";
  
          const statusCode = errorCode in errMap ? errMap[errorCode] : StatusCodes.INTERNAL_SERVER_ERROR;

          next(createRequestError(errorMessage, (error as Error).name, statusCode));
        }
      };

export const handleLoginUser =
  ({
    getUser = userService.getByEmail,
    ensurePasswordMatches = hashUtil.compare,
  } = {}) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password: passwordIn } = req.body;
        const user = await getUser(email);

        await ensurePasswordMatches(passwordIn, user.password);

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
          },
        });
      } catch (error) {
        const errMap: Record<string, StatusCodes> = {
          EMAIL_NOT_FOUND_ERROR: StatusCodes.UNAUTHORIZED,
          HASH_MISMATCH_ERROR: StatusCodes.UNAUTHORIZED,
        };

        next(
          createRequestError(
            (error as Error).message || "Unable to login user",
            (error as Error).name,
            errMap[(error as Error).name]
          )
        );
      }
    };
