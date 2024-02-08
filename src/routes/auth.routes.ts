import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as authSchema from "validations/auth.validation";
import validateSchema from "validations";

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
  "/resend/verify-email",
  validateSchema(authSchema.resendVerificationEmailSchema, "body"),
  authController.handleResendVerificationEmail()
);


export default authRouter;
