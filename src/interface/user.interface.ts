import IModelBase from "./base";

export interface IUserBase {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IUser extends IUserBase {
  isEmailVerified: boolean;
}

interface IUserModel extends IUser, IModelBase {}

export default IUserModel;
