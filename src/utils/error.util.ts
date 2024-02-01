import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";

class ServiceError extends Error {
  constructor(
    message: string,
    private readonly label: `${string}_ERROR`
  ) {
    super(message);
  }
}

class RequestError extends Error {
  constructor(
    message: string,
    private readonly label: string,
    private readonly statusCode: StatusCodes
  ) {
    super(message);
  }

  public getStatusCode() {
    return this.statusCode;
  }

  public getLabel() {
    return this.label;
  }
}

export const createServiceError = (
  message: string,
  label: `${string}_ERROR`
) => {
  return new ServiceError(message, label);
};

export const createRequestError = (
  message: string,
  name: string,
  statusCode?: StatusCodes
) => {
  return new RequestError(
    message,
    name,
    statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandlerMiddleware = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof RequestError) {
    return res.status(err.getStatusCode()).json({
      status: err.getStatusCode(),
      error: err.message,
      label: err.getLabel(),
    });
  } else if (err instanceof ServiceError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      error: err.message,
    });
  }

  // Generic error handling
  console.error(err);  // Log the error for debugging purposes
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: false,
    error: "Internal Server Error",
  });
};

export default errorHandlerMiddleware;
