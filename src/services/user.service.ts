import { IUserBase } from "../interface/user.interface";
import UserModel from "../models/user.model";
import { createServiceError } from "../utils/error.util";
import { StringOrObjectId } from "interface/base";

export const create = async (data: IUserBase, { User = UserModel } = {}) => {
  try {
    const user = await User.create(data);
    return user.toObject();
  } catch (error) {
    if ((error as { code: number }).code === 11000) {
      throw createServiceError("Email taken already", "DUPLICATE_EMAIL_ERROR");
    }

    throw error;
  }
};

export const getByEmail = async (email: string, { User = UserModel } = {}) => {
  const error = createServiceError("Email not found. Try registering your account", "EMAIL_NOT_FOUND_ERROR");
  const user = await User.findOne({ email }).orFail(error);
  return user.toObject();
};

export const getById = async (
  id: StringOrObjectId,
  { User = UserModel } = {}
) => {
  const error = createServiceError("", "USER_NOT_FOUND_ERROR");
  const user = await User.findById(id).orFail(error);
  return user.toObject();
};

export const verifiedEmail = (user: { isEmailVerified: boolean }) => {
  if (user.isEmailVerified) {
    const error = createServiceError(
      "Email has been verified. Please go ahead to login.",
      "EMAIL_VERIFIED_ERROR"
    );
    throw error;
  }
};
export const verifyEmail = (user: { isEmailVerified: boolean }) => {
  if (!user.isEmailVerified) {
    // Use createServiceError to create a new ServiceError instance
    const error = createServiceError(
      "Email not verified. Please verify your email before logging in.",
      "EMAIL_NOT_VERIFIED_ERROR"
    );
    throw error;
  }
};

export const update = async (
  userId: StringOrObjectId,
  data: Record<string, unknown>,
  { User = UserModel } = {}
) => {
  const error = createServiceError("", "USER_NOT_UPDATED_ERROR");
  const user = await User.findByIdAndUpdate(
    { _id: userId },
    { $set: data },
    { new: true }
  ).orFail(error);
  return user.toObject();
};
