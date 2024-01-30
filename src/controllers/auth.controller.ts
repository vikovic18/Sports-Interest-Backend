import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createRequestError } from "../utils/error.util";
import * as userService from "../services/user.service";
import * as otpService from "../services/otp.service";
import * as hashUtil from "../utils/hash.util";
import * as mailService from "../services/mail.service";
import { OtpType } from "utils/types.util";
import logger from "utils/logger.util";


export const handleRegisterUser =
  ({ createUser = userService.create, hashPassword = hashUtil.hash, generateToken = otpService.CreateOTP, sendVerificationEmail =  mailService.SendMail} = {}) =>
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

        logger.debug(`signup: ${user.email} creating OTP`);
        const otp = await generateToken({
          email: user.email,
          channel: OtpType.SIGNUP
        });

        logger.debug(`signup: ${user.email} sending verification mail`);

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${otp.token}`;

        // const mailOptions = {
        //   from: process.env.EMAIL_USER,
        //   to: userEmail,
        //   subject: "Verify Your Email",
        //   html: `<p>Please click on the following link to verify your email:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
        // };

        // const mail = await CreateMail({
        //   email: data.email,
        //   subject: "GSASConnect OTP",
        //   template: "otp",
        //   context: {
        //     code,
        //     expiresAt: expires
        //   }
        // });
        // log.debug(`CreateOtp: ${data.email} mail created with status ${mail.status}`);

        // if (mail.status !== MailStatus.SENT) {
        //   throw new Error("Error sending OTP mail");
        // }

  
        await sendVerificationEmail({
          email: user.email,
          subject: "Verify Your Email",
          context: {},
          template: `<p>Please click on the following link to verify your email:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
        });
        // logger.debug(`CreateOtp: ${user.email} mail created with status ${mail.status}`);

        // if (mail.status !== MailStatus.SENT) {
        //   throw new Error("Error sending OTP mail");
        // }

        res.json({
          status: true,
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

        next(
          createRequestError(
            (error as Error).message || "Unable to register user",
            (error as Error).name,
            errMap[(error as Error).name]
          )
        );
      }
    };

export const handleLoginUser =
  ({ getUser = userService.getByEmail, ensurePasswordMatches = hashUtil.compare } = {}) =>
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
            }
          }
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
