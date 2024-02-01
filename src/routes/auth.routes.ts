import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validateRegister } from "validations/auth.validation";

const authRouter = Router();

authRouter.post("/login", authController.handleLoginUser());

authRouter.post("/register", validateRegister, authController.handleRegisterUser());

export default authRouter;
