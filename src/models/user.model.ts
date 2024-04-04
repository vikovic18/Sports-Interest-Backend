import { Schema, model } from "mongoose";
import IUserModel from "../interface/user.interface";
import mergeWithBaseSchema from "./base";

let userSchema = new Schema<IUserModel>({
  userName: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    default: "",
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  interests: [{ type: String }],
});

userSchema = mergeWithBaseSchema(userSchema);

const UserModel = model<IUserModel>("User", userSchema);

export default UserModel;
