import IModelBase, { StringOrObjectId } from "./base";

export interface IMailBase {
  userId?: StringOrObjectId
  email: string
  subject: string
  template: string
  context: unknown
  
}

export interface IMail extends IMailBase{
  status?: string
}

interface IMailModel extends IMail, IModelBase {}

export default IMailModel;


