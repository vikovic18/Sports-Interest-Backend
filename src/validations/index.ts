import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger.util";
import type { Schema, ValidationError } from "joi";
import Joi from "joi";

const validateSchema =
  (schema: Schema, property: "body" | "query" | "params") =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const validated = await schema.validateAsync(req[property], {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: true,
        });
        req[property] = validated;
        next();
      } catch (error) {
        const details = (error as ValidationError).details;

        const err = {};
        details.forEach((detail: Joi.ValidationErrorItem) => {
        // @ts-expect-error context is defined
          err[detail.context?.key] = detail.message;
        });

        logger.debug(error);
        res.status(StatusCodes.BAD_REQUEST).json({
          status: "error",
          message: "Invalid request data",
          data: err,
        });
      }
    };

export default validateSchema;
