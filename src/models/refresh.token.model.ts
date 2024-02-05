import { model } from "mongoose";

import IRefreshTokenModel from "../interface/refresh.token.interface";

import mergeWithBaseSchema from "./base";

import mongoose from "mongoose";

let refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User is required"],
    },
    token: {
      type: String,
      required: [true, "Token is required"],
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      index: { expires: "30d" }
    },
  },
);

refreshTokenSchema = mergeWithBaseSchema(refreshTokenSchema);

const RefreshTokenModel = model<IRefreshTokenModel>(
  "RefreshToken",
  refreshTokenSchema
);

export default RefreshTokenModel;
