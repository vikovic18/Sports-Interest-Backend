import type { Request, Response, NextFunction } from "express";


export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.session.user === undefined) {
    res.status(401).json({
      message: "Not Authorized. You must be logged in"
    });
    return;
  }
  
  req.user = {
    id: req.session.user.id,
  };
  next();
};
  