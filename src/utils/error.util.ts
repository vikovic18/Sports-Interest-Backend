import { StatusCodes } from "http-status-codes";

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
