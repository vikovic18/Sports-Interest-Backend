import type { Document, Types } from "mongoose";

export interface IMail extends Document {
  user?: Types.ObjectId
  email: string
  subject: string
  template: string
  context: unknown
  status: string
}

export interface ICreateMail {
  email: string
  user?: string
  subject: string
  context: unknown
  template: string
}

export interface ISendMail {
  email: string
  subject: string
  context: unknown
  template: string
}
