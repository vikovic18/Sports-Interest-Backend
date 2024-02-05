import IModelBase, { StringOrObjectId } from "./base";

export interface IRefreshTokenBase {
  userId: StringOrObjectId;
  token: string;
}


interface IRefreshTokenModel extends IRefreshTokenBase, IModelBase {}

export default IRefreshTokenModel;
