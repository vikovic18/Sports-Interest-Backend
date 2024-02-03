import type { Types } from "mongoose";
import IModelBase from "./base";

export interface IMailBase {
  userId: Types.ObjectId
  email: string
  subject: string
  template: string
  context: unknown
  status: string
}

export interface ISendMail {
  email: string
  subject: string
  context: unknown
  template: string
}

interface IMailModel extends IMailBase, IModelBase {}

export default IMailModel;


