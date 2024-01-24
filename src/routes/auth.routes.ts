import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/login", authController.handleLoginUser());

authRouter.post("/register", authController.handleRegisterUser());

export default authRouter;
