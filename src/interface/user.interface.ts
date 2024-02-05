import IModelBase, { StringOrObjectId } from "./base";

export interface IUserBase {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ILoggedInUser {
  id: StringOrObjectId
}

export interface IUser extends IUserBase {
  isEmailVerified: boolean;
}

interface IUserModel extends IUser, IModelBase {}

export default IUserModel;
