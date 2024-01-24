import { Schema, model } from "mongoose";
import IUserModel from "../interface/user.interface";
import mergeWithBaseSchema from "./base";

let userSchema = new Schema<IUserModel>({
  firstName: {
    type: String,
    required: [true, "First name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
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
});

userSchema = mergeWithBaseSchema(userSchema);

const UserModel = model<IUserModel>("User", userSchema);

export default UserModel;
