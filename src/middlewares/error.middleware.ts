import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger.util";
import type { NextFunction, Request, Response } from "express";
import { RequestError } from "../utils/error.util";

export const handleNotFound = (req: Request, res: Response) => {
  const err = `Cannot ${req.method.toUpperCase()} ${req.path}`;

  res.status(StatusCodes.NOT_FOUND).json({
    status: false,
    message: err,
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleError = (err: RequestError, _req: Request, res: Response, _next: NextFunction) => {
  logger.warn(err.stack);

  res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: err.message,
  });
};
