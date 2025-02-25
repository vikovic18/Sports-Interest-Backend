import Joi from "joi";

export const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must have at least one uppercase letter, one lowercase letter, and one number.",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const resendVerificationEmailSchema = Joi.object({
  email: Joi.string().required()
}); 

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

export const accessTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().required()
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().required()
});

