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

authRouter.post(
  "/resend/verify-email",
  validateSchema(authSchema.resendVerificationEmailSchema, "body"),
  authController.handleResendVerificationEmail()
);

authRouter.post(
  "/reset-password/request",
  validateSchema(authSchema.forgotPasswordSchema, "body"),
  authController.handleForgotPassword()
);

authRouter.post(
  "/reset-password/verify",
  validateSchema(authSchema.verifyEmailSchema, "body"),
  authController.handleVerifyForgotPassword()
);

authRouter.post(
  "/reset-password/",
  validateSchema(authSchema.resetPasswordSchema, "body"),
  authController.handleResetPassword()
);

authRouter.post(
  "/logout/",
  isAuthenticated,
  authController.handleLogout()
);


export default authRouter;
