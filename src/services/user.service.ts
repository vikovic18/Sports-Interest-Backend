import { IUserBase } from "../interface/user.interface";
import UserModel from "../models/user.model";
import { createServiceError } from "../utils/error.util";

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
  const error = createServiceError("", "EMAIL_NOT_FOUND_ERROR");
  const user = await User.findOne({ email }).orFail(error);
  return user.toObject();
};

export const getById = async (id: string, { User = UserModel } = {}) => {
  const error = createServiceError("", "EMAIL_NOT_FOUND_ERROR");
  const user = await User.findById(id).orFail(error);
  return user.toObject();
};