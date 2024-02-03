import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createRequestError } from "../utils/error.util";
import * as userService from "../services/user.service";
import * as otpService from "../services/otp.service";
import * as hashUtil from "../utils/hash.util";
import * as mailService from "../services/mail.service";
import { OtpType } from "utils/types.util";

export const handleRegisterUser =
  ({
    createUser = userService.create,
    hashPassword = hashUtil.hash,
    generateToken = otpService.create,
    sendVerificationEmail = mailService.send,
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

        const otp = await generateToken({
          email: user.email,
          channel: OtpType.AUTH_REGISTER,
        });
        const verificationUrl = `${process.env.FRONTEND_ENV}/verify-email?token=${otp.token}`;

        await sendVerificationEmail({
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

        const statusCode = errMap[errorCode] || StatusCodes.INTERNAL_SERVER_ERROR;

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
