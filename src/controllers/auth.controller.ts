import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createRequestError } from "../utils/error.util";
import * as userService from "../services/user.service";
import * as hashUtil from "../utils/hash.util";

export const handleRegisterUser =
  ({ createUser = userService.create, hashPassword = hashUtil.hash } = {}) =>
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
