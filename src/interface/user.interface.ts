import IModelBase from "./base";

export interface IUserBase {
  userName: string;
  lastName: string;
  email: string;
  interests: string[]
  password: string;
}

export interface IUser extends IUserBase {
  isEmailVerified: boolean;
}

interface IUserModel extends IUser, IModelBase {}

export default IUserModel;
