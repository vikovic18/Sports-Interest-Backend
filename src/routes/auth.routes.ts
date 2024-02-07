import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as authSchema from "validations/auth.validation";
import validateSchema from "validations";
import { isAuthenticated } from "middlewares/auth.middleware";

const authRouter = Router();

authRouter.post(
  "/login",
  validateSchema(authSchema.loginSchema, "body"),
  authController.handleLoginUser()
);

authRouter.post(
  "/verify",
  validateSchema(authSchema.verifyEmailSchema, "body"),
  authController.handleVerifyEmailOnRegistration()
);

authRouter.post(
  "/register",
  validateSchema(authSchema.registerSchema, "body"),
  authController.handleRegisterUser()
);

authRouter.post(
  "/access-token",
  isAuthenticated,
  validateSchema(authSchema.accessTokenSchema, "body"),
  authController.handleGetAccessToken()
);

export default authRouter;
