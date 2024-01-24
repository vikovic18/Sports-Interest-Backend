import { type Request, type Response, Router } from "express";
import authRouter from "./auth.routes";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Service is up and running" });
});

router.use("/auth", authRouter);

export default router;
