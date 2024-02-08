import { IRefreshTokenBase } from "interface/refresh.token.interface";
import { createServiceError } from "../utils/error.util";
import RefreshTokenModel from "models/refresh.token.model";
import { StringOrObjectId } from "interface/base";

export const create = async (
  data: IRefreshTokenBase,
  { RefreshToken = RefreshTokenModel } = {}
) => {
  try {
    const refreshToken = await RefreshToken.create(data);
    return refreshToken.toObject();
  } catch (error) {
    throw createServiceError("", "REFRESHTOKEN_CANT__BE_CREATED_ERROR");
  }
};

export const get = async (
  data: Record<string, unknown>,
  { RefreshToken = RefreshTokenModel } = {}
) => {
  const error = createServiceError("", "REFRESH_TOKEN_NOT_FOUND_ERROR");
  const refreshToken = await RefreshToken.findOne(data).sort({ createdAt: -1 }).orFail(error);
  return refreshToken.toObject();
};

export const deleteToken = async (
  userId: StringOrObjectId,
  { RefreshToken = RefreshTokenModel } = {}
) => {
  const error = createServiceError("", "REFRESH_TOKENS_NOT_FOUND_ERROR");
  await RefreshToken.deleteMany({userId}).orFail(error);
};


