import { StatusCodes, getReasonPhrase } from "http-status-codes";

class ServiceError extends Error {
  constructor(
    message: string,
    public readonly name: `${string}_ERROR`,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RequestError extends Error {
  constructor(
    message: string,
    public readonly name: string,
    public readonly statusCode: StatusCodes,
  ) {
    super(message);
    const phraseName =
      this.statusCode &&
      getReasonPhrase(this.statusCode).replace(/\s/g, "_").toUpperCase();
    this.name = `${phraseName || "UNKNOWN_ERROR"}_${this.name}`;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createServiceError = (message: string, name: `${string}_ERROR`) => {
  return new ServiceError(message, name);
};

export const createRequestError = (
  message: string,
  name: string,
  statusCode?: StatusCodes,
) => {
  return new RequestError(message, name, statusCode || StatusCodes.INTERNAL_SERVER_ERROR);
};
