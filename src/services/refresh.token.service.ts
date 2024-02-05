import { IRefreshTokenBase } from "interface/refresh.token.interface";
import { createServiceError } from "../utils/error.util";
import RefreshTokenModel from "models/refresh.token.model";

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
