import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";


export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.session.user === undefined) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      status: "error",
      message: "Not Authorized. You must be logged in"
    });
    return;
  }
  
  req.user = {
    id: req.session.user.id,
  };
  next();
};
  