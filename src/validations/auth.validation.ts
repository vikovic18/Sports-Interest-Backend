import Joi from "joi";
import type { NextFunction, Request, Response } from "express";

const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$")).required().messages({
    "string.pattern.base": "Password must have at least one uppercase letter, one lowercase letter, and one number."
  })
});

// Validation middleware for registration
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }
  next();
};