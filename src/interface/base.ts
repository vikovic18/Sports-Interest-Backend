import { ObjectId } from "mongoose";

export type StringOrObjectId = string | ObjectId;

interface IModelBase {
  id: StringOrObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export default IModelBase;
