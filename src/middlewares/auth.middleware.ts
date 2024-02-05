import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "utils/jwt.util";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: "error",
      message: "Not Authorized. You must be logged in."
    });
  }

  try {
    const decoded = verifyJWT(token);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: "error",
      message: "Invalid token or token has expired."
    });
  }
};
  